const middie = require('@fastify/middie')
const { join, resolve, read, exists } = require('../ioutils')

async function setup (config) {
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
          server: this.scope.server
        }
      },
      appType: 'custom'
    }),
    config.vite
  )

  this.devServer = await createServer(devServerOptions)
  this.scope.use(this.devServer.middlewares)

  // Loads the Vite application server entry point for the client
  const loadClient = async () => {
    if (config.spa) {
      return {}
    }
    const modulePath = resolve(config.vite.root, config.clientModule.replace(/^\/+/, ''))
    const entryModule = await this.devServer.ssrLoadModule(modulePath)
    if (typeof entryModule.default === 'function') {
      const { default: htmlFunction, ...entryModuleExports } = entryModule
      return {
        html: htmlFunction,
        ...entryModuleExports,
      }
    } else {
      return entryModule.default || entryModule
    }
  }

  // Initialize Reply prototype decorations
  this.scope.decorateReply('render', null)
  this.scope.decorateReply('html', null)

  config.hasRenderFunction = typeof config.createRenderFunction === 'function'

  // Load fresh index.html template and client module before every request
  this.scope.addHook('onRequest', async (req, reply) => {
    const clientModule = await loadClient()
    const client = await config.prepareClient(clientModule, this.scope, config)
    const indexHtmlPath = join(config.vite.root, 'index.html')
    if (exists(indexHtmlPath)) {
      const indexHtml = await read(indexHtmlPath, 'utf8')
      const transformedHtml = await this.devServer.transformIndexHtml(req.url, indexHtml)
      // Set reply.html() function with latest version of index.html
      reply.html = await config.createHtmlFunction(transformedHtml, this.scope, config)
    } else {
      reply.html = await config.createHtmlFunction(clientModule.html, this.scope, config)
    }
    // Set reply.render() function with latest version of the client module
    if (config.hasRenderFunction) {
      reply.render = await config.createRenderFunction(client, this.scope, config)
    }
  })

  // Load routes from client module (server entry point)
  const clientModule = await loadClient()
  const client = await config.prepareClient(clientModule, this.scope, config)

  return { 
    config, 
    client, 
    routes: client?.routes, 
  }
}

module.exports = setup
