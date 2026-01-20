import { readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { Plugin as VitePlugin, ResolvedConfig, ViteDevServer } from 'vite'
import type { ModuleRunner } from 'vite/module-runner'
import middie from '@fastify/middie'
import type { DecoratedReply, RouteDefinition, RuntimeConfig } from '../types.ts'

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

interface SetupContext {
  scope: FastifyInstance
  devServer: ViteDevServer
  entries: Record<string, unknown>
  runners: Record<string, ModuleRunner>
  [key: symbol]: any
}

export async function setup(this: SetupContext, config: RuntimeConfig) {
  const loadEntryModulePaths = async (): Promise<Record<string, string> | null> => {
    if (config.spa) {
      return null
    }
    const entryModulePaths: Record<string, string> = {}

    const viteConfig = config.vite as ResolvedConfig

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

  if (!this.scope.hasDecorator('use')) {
    await this.scope.register(middie)
  }

  const baseConfig: any = {
    configFile: false,
    server: {
      middlewareMode: true,
      hmr: {
        server: this.scope.server,
      },
    },
    appType: 'custom',
  }
  const devServerOptions = mergeConfig(defineConfig(baseConfig) as any, config.vite as any) as any

  this.devServer = await createServer(devServerOptions)
  this.scope.use(this.devServer.middlewares as any)

  this.entries = {}

  const loadEntries = async () => {
    this.runners = {}

    const entryModulePaths = await loadEntryModulePaths()

    if (!entryModulePaths) {
      return
    }

    for (const [env, envConfig] of Object.entries(this.devServer.environments)) {
      if (env === 'client') {
        continue
      }
      const runner = createServerModuleRunner(envConfig)
      this.runners[env] = runner

      if (env in entryModulePaths) {
        const entryModule = await runner.import(entryModulePaths[env])
        if (!this.entries[env]) {
          this.entries[env] = { ...((entryModule as any).default ?? entryModule) }
        } else {
          Object.assign(this.entries[env], {
            ...((entryModule as any).default ?? entryModule),
          })
        }
      }
    }
  }

  this.scope.decorate(hot, {})

  this.scope.decorateReply('render', null)
  this.scope.decorateReply('html', null)

  Object.defineProperty(config, 'hasRenderFunction', {
    writable: false,
    value: typeof config.createRenderFunction === 'function',
  })

  this.scope.addHook('onRequest', async (req: FastifyRequest, reply: FastifyReply) => {
    await loadEntries()
    const client = !config.spa && (await config.prepareClient(this.entries, this.scope, config))
    this.scope[hot].client = client
    if (this.scope[hot].client) {
      if ((client as any).routes && typeof (client as any).routes[Symbol.iterator] === 'function') {
        if (!this.scope[hot].routeHash) {
          this.scope[hot].routeHash = new Map<string, RouteDefinition>()
        }
        for (const route of (client as any).routes) {
          if (route.path) {
            this.scope[hot].routeHash.set(route.path, route)
          }
        }
      }
    }
    const viteConfig = config.vite as ResolvedConfig
    const indexHtmlPath = join(viteConfig.root, 'index.html')
    const indexHtml = await readFile(indexHtmlPath, 'utf8')
    const transformedHtml = await this.devServer.transformIndexHtml(req.url, indexHtml)

    const decoratedReply = reply as DecoratedReply
    decoratedReply.html = await config.createHtmlFunction(transformedHtml, this.scope, config)

    if (config.hasRenderFunction) {
      decoratedReply.render = await config.createRenderFunction(
        this.scope[hot].client,
        this.scope,
        config,
      )
    }
  })

  this.scope.addHook('onClose', () => this.devServer.close())

  await loadEntries()

  const client = !config.spa && (await config.prepareClient(this.entries, this.scope, config))

  return {
    config,
    client,
    routes: (client as any)?.routes,
  }
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
