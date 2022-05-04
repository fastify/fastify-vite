const { resolve } = require('path')
const FastifyStatic = require('@fastify/static')
const { compileIndexHtml } = require('../html')

async function setup (options) {
  // For production you get the distribution version of the render function
  const { assetsDir } = options.vite.build

  // We also register fastify-static to serve all static files
  // in production (dev server takes of this)
  await this.scope.register(FastifyStatic, {
    root: resolve(options.bundle.dir, 'client', assetsDir),
    prefix: `/${assetsDir}`,
  })
  // Note: this is just to ensure it works, for a real world
  // production deployment, you'll want to capture those paths in
  // Nginx or just serve them from a CDN instead

  const _compileIndexHtml = options.renderer.compileIndexHtml ?? compileIndexHtml
  const _getEntry = options.renderer.getEntry ?? getEntry
  const _getHandler = options.renderer.getHandler ?? getHandler

  const { routes, render } = await _getEntry(options, options.renderer.createRenderFunction)
  const getTemplate = await _compileIndexHtml(options.bundle.indexHtml)
  const handler = _getHandler(this.scope, options, render, getTemplate)

  return { routes, handler }

  async function getEntry (options, createRenderFunction) {
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

  function getHandler (scope, options, render, getTemplate) {
    return async function (req, reply) {
      const url = req.raw.url
      const fragments = await render(scope, req, reply, url, options)
      reply.type('text/html')
      reply.send(getTemplate(req, fragments))
    }
  }
}

module.exports = { setup }
