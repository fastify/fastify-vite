const { resolve } = require('path')
const { exists } = require('../ioutils')
const FastifyStatic = require('@fastify/static')

async function setup (config) {
  // For production you get the distribution version of the render function
  const { assetsDir } = config.vite.build

  const clientDist = resolve(config.bundle.dir, 'client')
  const serverDist = resolve(config.bundle.dir, 'server')
  if (!exists(clientDist) || !exists(serverDist)) {
    throw new Error('No distribution bundle found.')
  }
  // We also register fastify-static to serve all static files
  // in production (dev server takes of this)
  await this.scope.register(FastifyStatic, {
    root: resolve(clientDist, assetsDir),
    prefix: `/${assetsDir}`,
  })
  // Note: this is just to ensure it works, for a real world
  // production deployment, you'll want to capture those paths in
  // Nginx or just serve them from a CDN instead

  // Load routes from client module (server entry point)
  const clientModule = await loadClient()
  const client = await config.prepareClient(clientModule)

  // Create route handler and route error handler functions
  const handler = await config.createRouteHandler(this.scope, client, config)
  const errorHandler = await config.createErrorHandler(this.scope, client, config)

  // Set reply.html() function with production version of index.html
  this.scope.decorateReply('html', await config.createHtmlFunction(
    this.scope,
    config.bundle.indexHtml,
    config,
  ))

  // Set reply.render() function with the client module production bundle
  this.scope.decorateReply('render', await config.createRenderFunction(
    this.scope,
    client,
    config,
  ))

  return { routes: client.routes, handler, errorHandler }

  // Loads the Vite application server entry point for the client
  async function loadClient () {
    const serverBundle = await import(resolve(config.bundle.dir, 'server/server.js'))
    return serverBundle.default ?? serverBundle
  }
}

module.exports = setup
