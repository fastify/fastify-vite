const { parse, resolve } = require('path')
const { writeFile } = require('fs').promises
const { mkdirSync, existsSync } = require('fs')
const { createServer } = require('vite')
const Fastify = require('fastify')
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

  if (options.generatePaths) {
    await build(options)
    options.dev = false
    options.recalcDist()
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
    handler = renderer.dev.getHandler(fastify, options, entry.getRender, vite)
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
    const entry = await renderer.getEntry(options)
    routes = entry.routes
    handler = renderer.getHandler(fastify, options, entry.render)
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
    route (url, { getData, getPayload, method, ...routeOptions } = {}) {
      const preHandler = routeOptions.preHandler || []
      if (getData) {
        preHandler.push(
          async function (req, reply) {
            req[options.hydration.data] = await getData.call(
              this,
              {
                req,
                reply,
                $api: this.api && this.api.client,
                fastify: this,
              },
            )
          },
        )
      }
      if (getPayload) {
        preHandler.push(
          async function (req, reply) {
            req[options.hydration.payload] = await getPayload.call(
              this,
              {
                req,
                reply,
                $api: this.api && this.api.client,
                fastify: this,
              },
            )
          },
        )
        fastify.get(`/-/payload${url}`, async function (req, reply) {
          return getPayload.call(this, {
            req,
            reply,
            $api: this.api && this.api.client,
            fastify: this,
          })
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
      getPayload: route.getPayload,
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

  fastify.vite.ready = async () => {
    await fastify.ready()
    if (fastify.vite.options.build) {
      await build(fastify.vite.options)
      process.exit()
    }
    if (fastify.vite.options.generatePaths) {
      const paths = []
      if (typeof fastify.vite.options.generatePaths === 'function') {
        await fastify.vite.options.generatePaths(path => paths.push(path))
      } else if (Array.isArray(fastify.vite.options.generatePaths)) {
        paths.push(...fastify.vite.options.generatePaths)
      }
      const tasks = []
      for (const path of paths) {
        tasks.push(async () => {
          try {
            const { payload } = await fastify.inject({ url: path })
            const name = path.slice(1) || 'index'
            const htmlPath = resolve(options.distDir, 'client', `${name}.html`)
            const { dir } = parse(htmlPath)
            if (!existsSync(dir)) {
              mkdirSync(dir)
            }
            await writeFile(htmlPath, payload)
          } catch (err) {
            console.error(err)
          }
        })
      }
      await Promise.all(tasks.map(task => task()))
      if (!fastify.vite.options.generateServer) {
        process.exit()
      }
    }

    if (fastify.vite.options.generateServer) {
      const { port, onGenerate } = fastify.vite.options.generateServer
      const builder = Fastify()
      builder.get('*', async (req, reply) => {
        const path = req.raw.url
        const { payload } = await fastify.inject({ url: path })
        const name = path.slice(1) || 'index'
        const htmlPath = resolve(options.distDir, 'client', `${name}.html`)
        const { dir } = parse(htmlPath)
        if (!existsSync(dir)) {
          mkdirSync(dir)
        }
        await writeFile(htmlPath, payload)
        reply.send(`Generated fresh static page for ${
          req.raw.url
        } for build on ${
          fastify.vite.options.distDir
        }`)
        onGenerate({ file: htmlPath, path })
      })
      await new Promise(() => {
        builder.listen(port, (err, address) => {
          if (err) {
            console.error(err)
            process.exit(1)
          }
          console.log(`Generate Server listening on ${address}`)
        })
      })
    }
  }

  fastify.addHook('onReady', async () => {
    // Pre-initialize request decorator for better performance
    // This actually safely adds things to Request.prototype
    fastify.decorateRequest(options.hydration.global, { getter: () => fastify.vite.global })
    fastify.decorateRequest(options.hydration.data, null)
    if (options.api) {
      fastify.decorateRequest('api', fastify.api)
    }
  })
}

module.exports = fastifyPlugin(fastifyVite)
