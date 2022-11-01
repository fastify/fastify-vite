const middie = require('middie')
const { createServer } = require('vite')
const { join, resolve, read } = require('../ioutils')

async function setup (config) {
  // Middie seems to work well for running Vite's development server
  // Unsure if fastify-express is warranted here
  await this.scope.register(middie)

  // Create and enable Vite's Dev Server middleware
  const devServerOptions = {
    configFile: false,
    ...config.vite,
    server: {
      middlewareMode: true,
      ...config.vite.server,
    },
    appType: 'custom',
  }
  this.devServer = await createServer(devServerOptions)
  this.scope.use(this.devServer.middlewares)

  // Loads the Vite application server entry point for the client
  const loadClient = async () => {
    if (config.spa) {
      return {}
    }
    const modulePath = resolve(config.vite.root, config.clientModule.replace(/^\/+/, ''))
    const entryModule = await this.devServer.ssrLoadModule(modulePath)
    return entryModule.default ?? entryModule
  }

  // Initialize Reply prototype decorations
  this.scope.decorateReply('render', null)
  this.scope.decorateReply('html', null)

  // Load fresh index.html template and client module before every request
  this.scope.addHook('onRequest', async (req, reply) => {
    const indexHtmlPath = join(config.vite.root, 'index.html')
    const indexHtml = await read(indexHtmlPath, 'utf8')
    const transformedHtml = await this.devServer.transformIndexHtml(req.url, indexHtml)
    const clientModule = await loadClient()
    const client = await config.prepareClient(clientModule, this.scope, config)
    // Set reply.html() function with latest version of index.html
    reply.html = await config.createHtmlFunction(transformedHtml, this.scope, config)
    // Set reply.render() function with latest version of the client module
    reply.render = await config.createRenderFunction(client, this.scope, config)
  })

  // Load routes from client module (server entry point)
  const clientModule = await loadClient()
  const client = await config.prepareClient(clientModule, this.scope, config)

  // Create route handler and route error handler functions
  const handler = await config.createRouteHandler(client, this.scope, config)
  const errorHandler = await config.createErrorHandler(client, this.scope, config)

  return { client, routes: client.routes, handler, errorHandler }
}

module.exports = setup
