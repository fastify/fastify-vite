import { readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { Plugin as VitePlugin, ResolvedConfig } from 'vite'
import { createServer, createServerModuleRunner } from 'vite'
import middie, { type Handler as MiddieHandler } from '@fastify/middie'
import type { ClientModule } from '../types/client.ts'
import type { DevRuntimeConfig } from '../types/options.ts'
import type { RouteDefinition } from '../types/route.ts'
import { hasIterableRoutes, type FastifyViteDecorationPriorToSetup } from './support.ts'

export const hot = Symbol('hotModuleReplacementProxy')

interface ViteEnvironmentsConfig {
  root: string
  environments: Record<
    string,
    {
      build?: {
        rollupOptions?: {
          input?: {
            index?: string
          }
        }
      }
    }
  >
}

interface HotState {
  client?: ClientModule
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
  if (runtimeConfig.spa) {
    return null
  }
  const entryModulePaths: Record<string, string> = {}

  const { viteConfig } = runtimeConfig

  if (!hasPlugin(viteConfig, 'vite-fastify')) {
    throw new Error("@fastify/vite's Vite plugin not registered")
  }

  const plugin = findPlugin(viteConfig, 'vite-fastify')
  const configHook = plugin.config

  const setupEnvironments = typeof configHook === 'function' ? configHook : configHook?.handler
  if (!setupEnvironments) {
    throw new Error("@fastify/vite's Vite plugin has no config hook")
  }

  const viteEnvsConfig: ViteEnvironmentsConfig = {
    root: viteConfig.root,
    environments: {},
  }

  await setupEnvironments.call({}, viteEnvsConfig, { mode: 'development' })

  const { client: _, ...nonClientEnvs } = Object.fromEntries(
    Object.keys(viteEnvsConfig.environments).map((env) => [env, 1]),
  )

  for (const env of Object.keys(nonClientEnvs)) {
    const environment = viteEnvsConfig.environments[env]
    if (environment.build?.rollupOptions?.input?.index) {
      const modulePath = environment.build.rollupOptions.input.index.startsWith(
        runtimeConfig.virtualModulePrefix,
      )
        ? environment.build.rollupOptions.input.index
        : resolve(viteConfig.root, environment.build.rollupOptions.input.index.replace(/^\/+/, ''))
      entryModulePaths[env] = modulePath
    }
  }
  return entryModulePaths
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
): Promise<ClientModule | undefined> {
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

  fastifyViteDecoration.scope.decorateReply('render', null)
  fastifyViteDecoration.scope.decorateReply('html', null)

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
          fastifyViteDecoration.entries,
          fastifyViteDecoration.scope,
          runtimeConfig,
        ))
      const client = clientResult ? (clientResult as ClientModule) : undefined
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
        reply.render = await runtimeConfig.createRenderFunction(
          hotScope[hot].client,
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
      fastifyViteDecoration.entries,
      fastifyViteDecoration.scope,
      runtimeConfig,
    ))
  const client = clientResult ? (clientResult as ClientModule) : undefined

  return client
}

function findPlugin(config: ResolvedConfig, pluginName: string): VitePlugin {
  for (const plugin of config.plugins) {
    if (Array.isArray(plugin)) {
      for (const subPlugin of plugin) {
        if ((subPlugin as VitePlugin).name === pluginName) {
          return subPlugin as VitePlugin
        }
      }
    }
    if ((plugin as VitePlugin).name === pluginName) {
      return plugin as VitePlugin
    }
  }
  const found = config.plugins.some((_) => {
    if (Array.isArray(_)) {
      return _.some((__) => (__ as VitePlugin).name === pluginName)
    }
    return (_ as VitePlugin).name === pluginName
  })
  return found ? ({} as VitePlugin) : ({} as VitePlugin)
}

function hasPlugin(config: ResolvedConfig, pluginName: string): boolean {
  return config.plugins.some((_) => {
    if (Array.isArray(_)) {
      return _.some((__) => (__ as VitePlugin).name === pluginName)
    }
    return (_ as VitePlugin).name === pluginName
  })
}
