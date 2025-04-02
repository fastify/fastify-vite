const middie = require('@fastify/middie')
const { join, resolve, read, exists } = require('../ioutils.cjs')

const hot = Symbol('hotModuleReplacementProxy')

async function setup(config) {
  const loadEntryModulePaths = async () => {
    if (config.spa) {
      return null
    }
    const entryModulePaths = {}
    if (!config.vite.plugins.some((_) => _.name === 'vite-fastify')) {
      throw new Error("@fastify/vite's Vite plugin not registered")
    }
    const { config: setupEnvironments } = config.vite.plugins.find(
      (_) => _.name === 'vite-fastify',
    )
    const viteEnvsConfig = {
      root: config.vite.root,
    }

    await setupEnvironments(viteEnvsConfig)

    const { client: _, ...nonClientEnvs } = Object.fromEntries(
      Object.keys(viteEnvsConfig.environments).map((env) => [env, 1]),
    )

    for (const env of Object.keys(nonClientEnvs)) {
      const environment = viteEnvsConfig.environments[env]
      if (environment.build?.rollupOptions?.input?.index) {
        const modulePath =
          environment.build.rollupOptions.input.index.startsWith('/:')
            ? environment
            : resolve(
                config.vite.root,
                environment.build.rollupOptions.input.index.replace(/^\/+/, ''),
              )
        entryModulePaths[env] = modulePath
      }
    }
    return entryModulePaths
  }

  const { createServer, createServerModuleRunner, mergeConfig, defineConfig } =
    await import('vite')

  // Middie seems to work well for running Vite's development server
  // Unsure if fastify-express is warranted here
  await this.scope.register(middie)

  // Create and enable Vite's Dev Server middleware
  const devServerOptions = mergeConfig(
    defineConfig({
      configFile: false,
      server: {
        middlewareMode: true,
        hmr: {
          server: this.scope.server,
        },
      },
      appType: 'custom',
    }),
    config.vite,
  )

  this.devServer = await createServer(devServerOptions)
  this.scope.use(this.devServer.middlewares)

  const loadEntries = async () => {
    const entryModulePaths = await loadEntryModulePaths()

    this.runners = {}
    this.entries = {}

    for (const [env, envConfig] of Object.entries(
      this.devServer.environments,
    )) {
      if (env === 'client') {
        continue
      }
      const runner = createServerModuleRunner(envConfig)
      this.runners[env] = runner

      if (env in entryModulePaths) {
        const entryModule = await runner.import(entryModulePaths[env])
        this.entries[env] = entryModule.default ?? entryModule
      }
    }
  }

  this.scope.decorate(hot, {})

  // Initialize Reply prototype decorations
  this.scope.decorateReply('render', null)
  this.scope.decorateReply('html', null)

  Object.defineProperty(config, 'hasRenderFunction', {
    writable: false,
    value: typeof config.createRenderFunction === 'function',
  })

  // Load fresh index.html template and client module before every request
  this.scope.addHook('onRequest', async (req, reply) => {
    await loadEntries()
    this.scope[hot].client = await config.prepareClient(
      this.entries,
      this.scope,
      config,
    )
    if (client.routes && typeof client.routes[Symbol.iterator] === 'function') {
      if (!this.scope[hot].routeHash) {
        this.scope[hot].routeHash = new Map()
      }
      for (const route of this.scope[hot].client.routes) {
        if (route.path) {
          this.scope[hot].routeHash.set(route.path, route)
        }
      }
    }
    const indexHtmlPath = join(config.vite.root, 'index.html')
    const indexHtml = await read(indexHtmlPath, 'utf8')
    const transformedHtml = await this.devServer.transformIndexHtml(
      req.url,
      indexHtml,
    )

    // Set reply.html() function with latest version of index.html
    reply.html = await config.createHtmlFunction(
      transformedHtml,
      this.scope,
      config,
    )

    // Set reply.render() function with latest version of the client module
    if (config.hasRenderFunction) {
      reply.render = await config.createRenderFunction(
        this.scope[hot].client,
        this.scope,
        config,
      )
    }
  })

  // Close the dev server when Fastify closes
  this.scope.addHook('onClose', () => this.devServer.close())

  await loadEntries()

  const client = await config.prepareClient(this.entries, this.scope, config)

  return {
    config,
    client,
    routes: client?.routes,
  }
}

module.exports = {
  setup,
  hot,
}
