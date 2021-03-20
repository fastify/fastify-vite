const { assign, resolve, vite, middie, staticPlugin, fp, defaults } = require('./deps')
const { getHandler, getRenderGetter } = require('./handler')

async function fastifyVite (fastify, options) {
  // Set option defaults
  options = assign(defaults, options)
  if (typeof options.rootDir === 'function') {
    options.rootDir = options.rootDir(resolve)
  }
  if (!options.dev) {
    options.distDir = resolve(options.rootDir, 'dist')
    options.distIndex = resolve(options.distDir, 'client/index.html')
    options.distManifest = require(resolve(options.distDir, 'client/ssr-manifest.json'))
  } else {
    options.distManifest = []
  }

  // We'll want access to this later
  let handler
  let viteDevServer

  // Setup appropriate Vite route handler
  // For dev you get more detailed logging and sautoreload
  if (options.dev) {
    viteDevServer = await vite.createServer({
      root: options.rootDir,
      logLevel: 'error',
      server: { middlewareMode: true }
    })
    await fastify.register(middie)
    fastify.use(viteDevServer.middlewares)

    const getTemplate = getRenderGetter(options)
    handler = getHandler(options, getTemplate, viteDevServer)
  } else {
    fastify.register(staticPlugin, {
      root: resolve(options.distDir, 'client/assets'),
      prefix: '/assets'
    })
    const getTemplate = getRenderGetter(options)
    handler = getHandler(options, getTemplate)
  }

  // Sets fastify.vite.get() helper which uses
  // a wrapper for setting a route with a data() handler
  fastify.decorate('vite', {
    handler,
    global: undefined,
    config: options,
    devServer: viteDevServer,
    get (url, { data, ...routeOptions } = {}) {
      return this.route(url, { data, method: 'GET', ...routeOptions })
    },
    post (url, { data, method, ...routeOptions } = {}) {
      return this.route(url, { data, method: 'GET', ...routeOptions })
    },
    route (url, { data, method, ...routeOptions } = {}) {
      let preHandler
      if (data) {
        preHandler = async function (req, reply) {
          req[options.dataKey] = await data.call(this, req, reply)
        }
      }
      fastify.get(`/-/data${url}`, async function (req, reply) {
        return data.call(this, req, reply)
      })
      fastify.route({
        method,
        url,
        preHandler,
        handler,
        ...routeOptions
      })
    }
  })
  fastify.addHook('onReady', () => {
    // Pre-initialize request decorator for better performance
    // This actually safely adds things to Request.prototype
    fastify.decorateRequest(options.globalDataKey, { getter: () => fastify.vite.global })
    fastify.decorateRequest(options.dataKey, null)
    if (options.api) {
      fastify.decorateRequest('api', fastify.api)
    }
  })
}

module.exports = fp(fastifyVite)
