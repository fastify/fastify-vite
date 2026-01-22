import { readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { InlineConfig, Plugin as VitePlugin, ResolvedConfig, UserConfig } from 'vite'
import middie, { type Handler as MiddieHandler } from '@fastify/middie'
import type { ClientModule } from '../types/client.ts'
import type { DevRuntimeConfig } from '../types/options.ts'
import type { DecoratedReply } from '../types/reply.ts'
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

export async function setup(
  fastifyViteDecoration: FastifyViteDecorationPriorToSetup,
): Promise<ClientModule | undefined> {
  const config = fastifyViteDecoration.runtimeConfig as DevRuntimeConfig

  async function loadEntryModulePaths(): Promise<Record<string, string> | null> {
    if (config.spa) {
      return null
    }
    const entryModulePaths: Record<string, string> = {}

    const viteConfig = config.vite

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
          config.virtualModulePrefix,
        )
          ? environment.build.rollupOptions.input.index
          : resolve(
              viteConfig.root,
              environment.build.rollupOptions.input.index.replace(/^\/+/, ''),
            )
        entryModulePaths[env] = modulePath
      }
    }
    return entryModulePaths
  }

  const { createServer, createServerModuleRunner, mergeConfig, defineConfig } = await import('vite')

  if (!fastifyViteDecoration.scope.hasDecorator('use')) {
    await fastifyViteDecoration.scope.register(middie)
  }

  const baseConfig: InlineConfig = {
    configFile: false,
    server: {
      middlewareMode: true,
      hmr: {
        server: fastifyViteDecoration.scope.server,
      },
    },
    appType: 'custom',
  }
  const devServerOptions = mergeConfig(
    defineConfig(baseConfig) as UserConfig,
    config.vite as unknown as UserConfig,
  ) as InlineConfig

  fastifyViteDecoration.devServer = await createServer(devServerOptions)
  // Connect.Server implements the middleware handler interface
  fastifyViteDecoration.scope.use(
    fastifyViteDecoration.devServer.middlewares as unknown as MiddieHandler,
  )

  fastifyViteDecoration.entries = {}

  const loadEntries = async () => {
    fastifyViteDecoration.runners = {}

    const entryModulePaths = await loadEntryModulePaths()

    if (!entryModulePaths) {
      return
    }

    for (const [env, envConfig] of Object.entries(fastifyViteDecoration.devServer.environments)) {
      if (env === 'client') {
        continue
      }
      const runner = createServerModuleRunner(envConfig)
      fastifyViteDecoration.runners[env] = runner

      if (env in entryModulePaths) {
        const entryModule = (await runner.import(entryModulePaths[env])) as LoadedEntryModule
        const clientModule: ClientModule = entryModule.default ?? entryModule
        if (!fastifyViteDecoration.entries[env]) {
          fastifyViteDecoration.entries[env] = { ...clientModule }
        } else {
          Object.assign(fastifyViteDecoration.entries[env], clientModule)
        }
      }
    }
  }

  fastifyViteDecoration.scope.decorate(hot, {})
  // After decoration, the scope has the hot state
  const hotScope = fastifyViteDecoration.scope as HotScope

  fastifyViteDecoration.scope.decorateReply('render', null)
  fastifyViteDecoration.scope.decorateReply('html', null)

  Object.defineProperty(config, 'hasRenderFunction', {
    writable: false,
    value: typeof config.createRenderFunction === 'function',
  })

  fastifyViteDecoration.scope.addHook(
    'onRequest',
    async (req: FastifyRequest, reply: FastifyReply) => {
      await loadEntries()
      const clientResult =
        !config.spa &&
        (await config.prepareClient(
          fastifyViteDecoration.entries,
          fastifyViteDecoration.scope,
          config,
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
      const viteConfig = config.vite
      const indexHtmlPath = join(viteConfig.root, 'index.html')
      const indexHtml = await readFile(indexHtmlPath, 'utf8')
      const transformedHtml = await fastifyViteDecoration.devServer.transformIndexHtml(
        req.url,
        indexHtml,
      )

      const decoratedReply = reply as DecoratedReply
      decoratedReply.html = await config.createHtmlFunction(
        transformedHtml,
        fastifyViteDecoration.scope,
        config,
      )

      if (config.hasRenderFunction) {
        decoratedReply.render = await config.createRenderFunction(
          hotScope[hot].client,
          fastifyViteDecoration.scope,
          config,
        )
      }
    },
  )

  fastifyViteDecoration.scope.addHook('onClose', () => fastifyViteDecoration.devServer.close())

  await loadEntries()

  const clientResult =
    !config.spa &&
    (await config.prepareClient(fastifyViteDecoration.entries, fastifyViteDecoration.scope, config))
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
