const { resolve } = require('path')
const { createServer } = require('vite')
const middie = require('middie')
const fastifyPlugin = require('fastify-plugin')
const fastifyStatic = require('fastify-static')

const { build } = require('./build')
const { processOptions } = require('./options')

async function fastifyVite (fastify, options) {
  // Run options through Vite to get all Vite defaults taking vite.config.js
  // into account and ensuring options.root and options.vite.root are the same
  try {
    options = await processOptions(options)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }

  // Provided by the chosen rendering adapter
  const renderer = options.renderer

  // We'll want access to this later
  let handler
  let routes
  let vite

  // Setup appropriate Vite route handler
  if (options.dev) {
    // For dev you get more detailed logging and hot reload
    vite = await createServer({
      server: { middlewareMode: 'ssr' },
      ...options.vite,
    })
    await fastify.register(middie)
    fastify.use(vite.middlewares)
    const entry = await renderer.dev.getEntry(options, vite)
    handler = renderer.dev.getHandler(options, entry.getRender, vite)
    routes = entry.routes
  } else {
    // For production you get the distribution version of the render function
    const { assetsDir } = options.vite.build
    // We also register fastify-static to serve all static files in production (dev server takes of this)
    // Note: this is just to ensure it works, for a real world production deployment, you'll want
    // to capture those paths in Nginx or just serve them from a CDN instead
    // TODO make it possible to serve static assets from CDN
    await fastify.register(fastifyStatic, {
      root: resolve(options.distDir, `client/${assetsDir}`),
      prefix: `/${assetsDir}`,
    })
    const entry = renderer.getEntry(options)
    routes = entry.routes
    handler = renderer.getHandler(options, entry.render)
  }

  // Sets fastify.vite.get() helper which uses
  // a wrapper for setting a route with a data() handler
  fastify.decorate('vite', {
    handler,
    options,
    global: undefined,
    // Not available when NODE_ENV=production
    devServer: vite,
    get (url, { data, ...routeOptions } = {}) {
      return this.route(url, { data, method: 'GET', ...routeOptions })
    },
    post (url, { data, method, ...routeOptions } = {}) {
      return this.route(url, { data, method: 'GET', ...routeOptions })
    },
    route (url, { getData, method, ...routeOptions } = {}) {
      let preHandler = routeOptions.preHandler || []
      if (getData) {
        preHandler.push(
          async function (req, reply) {
            req[options.hydration.data] = await getData.call(
              this,
              {
                $api: this.api && this.api.client,
                fastify: this,
              },              
              req,
              reply
            )
          }
        )
        fastify.get(`/-/data${url}`, async function (req, reply) {
          return getData.call(this, req, reply)
        })
      }
      fastify.route({
        method,
        url,
        handler,
        ...routeOptions,
        preHandler,        
      })
    },
  })

  for (const route of routes) {
    fastify.vite.route(route.path, {
      method: route.method || 'GET',
      getData: route.getData,
      onRequest: route.onRequest,
      preParsing: route.preParsing,
      preValidation: route.preValidation,
      preHandler: route.preHandler,
      preSerialization: route.preSerialization,
      onError: route.onError,
      onSend: route.onSend,
      onResponse: route.onResponse,
      onTimeout: route.onTimeout,
    })
  }

  fastify.addHook('onReady', () => {
    // Pre-initialize request decorator for better performance
    // This actually safely adds things to Request.prototype
    fastify.decorateRequest(options.hydration.global, { getter: () => fastify.vite.global })
    fastify.decorateRequest(options.hydration.data, null)
    if (options.api) {
      fastify.decorateRequest('api', fastify.api)
    }
  })
}

fastifyVite.app = async function appExport (main, serve) {
  const fastify = await main(require('fastify')())
  if (process.argv.length > 2 && process.argv[2] === 'build') {
    build(fastify.vite.options)
  } else {
    serve(fastify)
  }
}

module.exports = fastifyPlugin(fastifyVite)
