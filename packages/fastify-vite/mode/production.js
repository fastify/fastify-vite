const { parse, resolve, join, exists } = require('../ioutils')
const FastifyStatic = require('@fastify/static')

function fileUrl (str) {
  if (typeof str !== 'string') {
    throw new Error('Expected a string')
  }

  let pathName = resolve(str).replace(/\\/g, '/')

  // Windows drive letter must be prefixed with a slash
  if (pathName[0] !== '/') {
    pathName = `/${pathName}`
  }

  return encodeURI(`file://${pathName}`)
}

async function setup (config) {
  if (!config.bundle) {
    throw new Error('No distribution bundle found.')
  }
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
  const handler = await config.createRouteHandler(client, this.scope, config)
  const errorHandler = await config.createErrorHandler(client, this.scope, config)

  // Set reply.html() function with production version of index.html
  this.scope.decorateReply('html', await config.createHtmlFunction(
    config.bundle.indexHtml,
    this.scope,
    config,
  ))

  // Set reply.render() function with the client module production bundle
  this.scope.decorateReply('render', await config.createRenderFunction(
    client,
    this.scope,
    config,
  ))

  return { client, routes: client.routes, handler, errorHandler }

  // Loads the Vite application server entry point for the client
  async function loadClient () {
    const serverFile = join('server', `${parse(config.clientModule).name}.js`)
    // Use file path on Windows
    const serverBundlePath = process.platform === 'win32'
      ? fileUrl(resolve(config.bundle.dir, serverFile))
      : resolve(config.bundle.dir, serverFile)
    const serverBundle = await import(serverBundlePath)
    return serverBundle.default ?? serverBundle
  }
}

module.exports = setup
