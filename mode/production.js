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

  const { getHandler, createRenderFunction } = Object.assign({ getHandler: _getHandler }, options)
  const { routes, render: renderApp } = await loadServerEntry(options, createRenderFunction)
  const renderIndexHtml = await options.compileIndexHtml(options.bundle.indexHtml)
  const handler = getHandler(this.scope, options, renderApp, renderIndexHtml)

  return { routes, handler }

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

  function _getHandler (scope, options, renderApp, renderIndexHtml) {
    return async function (req, reply) {
      const url = req.raw.url
      const indexHtmlContext = await renderApp(scope, req, reply, url, options)
      indexHtmlContext.fastify = scope
      indexHtmlContext.req = req
      indexHtmlContext.reply = reply      
      reply.type('text/html')
      reply.send(renderIndexHtml(indexHtmlContext))
    }
  }
}

module.exports = { setup }
