import { readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { createServer, createServerModuleRunner } from 'vite'
import middie, { type Handler as MiddieHandler } from '@fastify/middie'
import type { ClientModule } from '../types/client.ts'
import type { DevRuntimeConfig } from '../types/options.ts'
import type { RouteDefinition } from '../types/route.ts'
import { hasIterableRoutes, type FastifyViteDecorationPriorToSetup } from './support.ts'

export const hot = Symbol('hotModuleReplacementProxy')

interface HotState {
  client?: ClientModule | null
  routeHash?: Map<string, RouteDefinition>
}

/** Fastify scope after being decorated with hot state */
interface HotScope extends FastifyInstance {
  [hot]: HotState
}

/** Module loaded via ModuleRunner that may have a default export */
interface LoadedEntryModule {
  default?: ClientModule
  [key: string]: unknown
}

async function loadEntryModulePaths(
  runtimeConfig: DevRuntimeConfig,
): Promise<Record<string, string> | null> {
  if (runtimeConfig.spa) return null

  const { viteConfig } = runtimeConfig
  const result: Record<string, string> = {}

  for (const [envName, env] of Object.entries(viteConfig.environments ?? {})) {
    if (envName === 'client') continue
    const input = env.build?.rollupOptions?.input
    if (!input) continue
    const entry = Object.values(input).find(Boolean) as string | undefined
    if (!entry) continue
    // Strip Vite's \0 virtual module prefix before checking against virtualModulePrefix
    const cleanPath = entry.charCodeAt(0) === 0 ? entry.slice(1) : entry
    result[envName] = cleanPath.startsWith(runtimeConfig.virtualModulePrefix)
      ? cleanPath
      : resolve(viteConfig.root, cleanPath.replace(/^\/+/, ''))
  }
  return Object.keys(result).length > 0 ? result : null
}

export async function loadEntries(
  fastifyViteDecoration: FastifyViteDecorationPriorToSetup,
  config: DevRuntimeConfig,
): Promise<void> {
  // Initialize runners object only once to prevent memory leaks
  // Vite's ModuleRunner.import() automatically returns the latest version after HMR updates
  if (!fastifyViteDecoration.runners) {
    fastifyViteDecoration.runners = {}
  }

  const entryModulePaths = await loadEntryModulePaths(config)

  if (!entryModulePaths) {
    return
  }

  for (const [env, envConfig] of Object.entries(fastifyViteDecoration.devServer!.environments)) {
    if (env === 'client') {
      continue
    }

    // Reuse existing runner or create a new one
    let runner = fastifyViteDecoration.runners[env]
    if (!runner) {
      runner = createServerModuleRunner(envConfig)
      fastifyViteDecoration.runners[env] = runner
    }

    if (env in entryModulePaths) {
      const entryModule = (await runner.import(entryModulePaths[env])) as LoadedEntryModule
      const clientModule: ClientModule = entryModule.default ?? entryModule
      if (!fastifyViteDecoration.entries![env]) {
        fastifyViteDecoration.entries![env] = { ...clientModule }
      } else {
        Object.assign(fastifyViteDecoration.entries![env], clientModule)
      }
    }
  }
}

export async function setup(
  fastifyViteDecoration: FastifyViteDecorationPriorToSetup,
): Promise<ClientModule | null> {
  const runtimeConfig = fastifyViteDecoration.runtimeConfig as DevRuntimeConfig

  if (!fastifyViteDecoration.scope.hasDecorator('use')) {
    await fastifyViteDecoration.scope.register(middie)
  }

  fastifyViteDecoration.devServer = await createServer({
    configFile: runtimeConfig.viteConfig.configFile,
    server: {
      middlewareMode: true,
      hmr: {
        server: fastifyViteDecoration.scope.server,
      },
    },
    appType: 'custom',
  })
  // Connect.Server implements the middleware handler interface
  fastifyViteDecoration.scope.use(
    fastifyViteDecoration.devServer.middlewares as unknown as MiddieHandler,
  )

  fastifyViteDecoration.entries = {}

  fastifyViteDecoration.scope.decorate(hot, {})
  // After decoration, the scope has the hot state
  const hotScope = fastifyViteDecoration.scope as HotScope

  fastifyViteDecoration.scope.decorateReply('render', null as never)
  fastifyViteDecoration.scope.decorateReply('html', null as never)

  Object.defineProperty(runtimeConfig, 'hasRenderFunction', {
    writable: false,
    value: typeof runtimeConfig.createRenderFunction === 'function',
  })

  fastifyViteDecoration.scope.addHook(
    'onRequest',
    async (req: FastifyRequest, reply: FastifyReply) => {
      await loadEntries(fastifyViteDecoration, runtimeConfig)
      const clientResult =
        !runtimeConfig.spa &&
        (await runtimeConfig.prepareClient(
          fastifyViteDecoration.entries!,
          fastifyViteDecoration.scope,
          runtimeConfig,
        ))
      const client = clientResult ? (clientResult as ClientModule) : null
      hotScope[hot].client = client
      if (client && hasIterableRoutes(client)) {
        if (!hotScope[hot].routeHash) {
          hotScope[hot].routeHash = new Map<string, RouteDefinition>()
        }
        for (const route of client.routes) {
          if (route.path) {
            hotScope[hot].routeHash.set(route.path, route)
          }
        }
      }
      const { viteConfig } = runtimeConfig
      const indexHtmlPath = join(viteConfig.root, 'index.html')
      const indexHtml = await readFile(indexHtmlPath, 'utf8')
      const transformedHtml = await fastifyViteDecoration.devServer!.transformIndexHtml(
        req.url,
        indexHtml,
      )

      reply.html = await runtimeConfig.createHtmlFunction(
        transformedHtml,
        fastifyViteDecoration.scope,
        runtimeConfig,
      )

      if (runtimeConfig.hasRenderFunction) {
        reply.render = await runtimeConfig.createRenderFunction!(
          hotScope[hot].client!,
          fastifyViteDecoration.scope,
          runtimeConfig,
        )
      }
    },
  )

  fastifyViteDecoration.scope.addHook('onClose', async () => {
    // Close all runners to clean up HMR event listeners
    if (fastifyViteDecoration.runners) {
      await Promise.all(
        Object.values(fastifyViteDecoration.runners).map((runner) => runner.close()),
      )
    }
    await fastifyViteDecoration.devServer!.close()
  })

  await loadEntries(fastifyViteDecoration, runtimeConfig)

  const clientResult =
    !runtimeConfig.spa &&
    (await runtimeConfig.prepareClient(
      fastifyViteDecoration.entries!,
      fastifyViteDecoration.scope,
      runtimeConfig,
    ))
  const client = clientResult ? (clientResult as ClientModule) : null

  return client
}
