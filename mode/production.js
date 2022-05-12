const { resolve } = require('path')
const { exists } = require('../ioutils')
const FastifyStatic = require('@fastify/static')

async function setup (options) {
  // For production you get the distribution version of the render function
  const { assetsDir } = options.vite.build

  const clientDist = resolve(options.bundle.dir, 'client')
  const serverDist = resolve(options.bundle.dir, 'server')
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

  const serverEntryPoint = await loadServerEntry(options)
  // Create vite.render, vite.routes and vite.handler references
  Object.assign(this, , {
    handler: options.createRouteHandler(this.scope, options),
  })
  
  this.scope.decorateReply('render', render)
  this.scope.decorateReply('html', await options.createHtmlFunction(options.bundle.indexHtml))

  async function loadServerEntry (options, createRenderFunction) {
    // Load production template source only once in prod
    const serverBundle = await import(resolve(options.bundle.dir, 'server/server.js'))
    let entry = serverBundle.default ?? serverBundle
    if (typeof entry === 'function') {
      entry = entry(createRenderFunction)
    }
    return {
      routes: typeof entry.routes === 'function'
        ? await entry.routes?.()
        : entry.routes,
      render: entry.render,
    }
  }
}

module.exports = { setup }
