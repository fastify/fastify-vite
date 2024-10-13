const middie = require('@fastify/middie')
const { join, resolve, read, exists } = require('../ioutils.cjs')

const hot = Symbol('hotModuleReplacementProxy')

async function setup(config) {
  const { createServer, mergeConfig, defineConfig } = await import('vite')

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

  this.scope.decorate(hot, {})

  // Loads the Vite application server entry point for the client
  const loadClient = async () => {
    if (config.spa) {
      return {}
    }
    const modulePath = config.clientModule.startsWith('/:')
      ? config.clientModule
      : resolve(
          config.vite.root,
          config.clientModule.replace(/^\/+/, ''),
        )
    let entryModule = await this.devServer.ssrLoadModule(modulePath)
    if (typeof entryModule.default === 'function') {
      entryModule = await entryModule.default(config)
      return entryModule
    }
    return {
      module: entryModule.default || entryModule,
    }
  }

  // Initialize Reply prototype decorations
  this.scope.decorateReply('render', null)
  this.scope.decorateReply('html', null)

  Object.defineProperty(config, 'hasRenderFunction', {
    writable: false,
    value: typeof config.createRenderFunction === 'function',
  })

  // Load fresh index.html template and client module before every request
  this.scope.addHook('onRequest', async (req, reply) => {
    const { module: clientModule } = await loadClient()
    this.scope[hot].client = await config.prepareClient(
      clientModule,
      this.scope,
      config,
    )
    if (
      this.scope[hot].client?.routes &&
      typeof this.scope[hot].client.routes[Symbol.iterator] === 'function'
    ) {
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

  // Load routes from client module (server entry point)
  const { module: clientModule } = await loadClient()
  const client = await config.prepareClient(clientModule, this.scope, config)

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
