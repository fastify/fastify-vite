const { resolve, parse } = require('path')
const { readFile, writeFile } = require('fs').promises
const { existsSync } = require('fs')
const { ensureDir } = require('fs-extra')
const { createServer } = require('vite')
const matchit = require('matchit')
const Fastify = require('fastify')
const middie = require('middie')
const { fetch } = require('undici')
const fastifyPlugin = require('fastify-plugin')
const fastifyStatic = require('fastify-static')

const { build } = require('./build')
const { generateRoute } = require('./static')
const { processOptions } = require('./options')

async function fastifyVite (fastify, options) {
  let viteReady
  const isViteReady = new Promise((resolve) => {
    viteReady = resolve
  })

  fastify.decorate('vite', {
    ready () {
      return isViteReady
    },
  })

  // Run options through Vite to get all Vite defaults taking vite.config.js
  // into account and ensuring options.root and options.vite.root are the same
  try {
    options = await processOptions(options)
  } catch (err) {
    console.error(err)
    setImmediate(() => process.exit(1))
    return
  }

  if (options.suppressExperimentalWarnings) {
    // See https://github.com/nodejs/node/issues/30810
    const { emitWarning } = process

    process.emitWarning = (warning, ...args) => {
      if (args[0] === 'ExperimentalWarning') {
        return
      }
      if (args[0] && typeof args[0] === 'object' && args[0].type === 'ExperimentalWarning') {
        return
      }
      return emitWarning(warning, ...args)
    }
  }

  if (options.generate.enabled || options.generate.server.enabled) {
    console.log('await build(options)')
    await build(options)
    options.dev = false
    console.log('options.recalcDist()')
    options.recalcDist()
  }

  // Provided by the chosen rendering adapter
  const renderer = options.renderer

  // We'll want access to this later
  let handler
  let vite
  let routes = []

  if (options.build) {
    await build(options)
    setImmediate(() => process.exit(0))
  } else if (!options.eject) {
    // Setup appropriate Vite route handler
    if (options.dev) {
      // For dev you get more detailed logging and hot reload
      vite = await createServer({
        ...options.vite,
        server: {
          middlewareMode: 'ssr',
          ...options.vite.server,
        },
      })
      await fastify.register(middie)
      fastify.use(vite.middlewares)
      const indexHtmlPath = resolve(options.root, 'index.html')
      if (!existsSync(indexHtmlPath)) {
        const baseIndexHtmlPath = resolve(renderer.path, 'base', 'index.html')
        await writeFile(indexHtmlPath, await readFile(baseIndexHtmlPath, 'utf8'))
      }
      const getTemplate = async (url) => {
        const indexHtml = await readFile(indexHtmlPath, 'utf8')
        const transformedHtml = await vite.transformIndexHtml(url, indexHtml)
        return await renderer.compileIndexHtml(transformedHtml)
      }
      const entry = await renderer.dev.getEntry(options, vite)
      handler = renderer.dev.getHandler(fastify, options, entry.getRender, getTemplate, vite)
      if (entry.routes) {
        routes = await entry.routes()
      }
    } else if (!options.eject) {
      // For production you get the distribution version of the render function
      const { assetsDir } = options.vite.build
      // We also register fastify-static to serve all static files
      // in production (dev server takes of this)
      // Note: this is just to ensure it works, for a real world
      // production deployment, you'll want to capture those paths in
      // Nginx or just serve them from a CDN instead
      await fastify.register(fastifyStatic, {
        root: resolve(options.distDir, `client/${assetsDir}`),
        prefix: `/${assetsDir}`,
      })
      const template = await renderer.compileIndexHtml(options.distIndex)
      const entry = await renderer.getEntry(options)
      if (entry.routes) {
        routes = await entry.routes()
      }
      handler = renderer.getHandler(fastify, options, entry.render, template)
    }
  }

  viteReady()

  // Sets fastify.vite.get() helper which uses
  // a wrapper for setting a route with a data() handler
  Object.assign(fastify.vite, {
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
            req[options.hydration.data] = await getData(
              {
                req,
                params: req.params,
                reply,
                $api: this.api && this.api.client,
                fastify: this,
                fetch,
              },
            )
          },
        )
      }
      if (getPayload) {
        preHandler.push(
          async function (req, reply) {
            req[options.hydration.payload] = await getPayload(
              {
                req,
                params: req.params,
                reply,
                $api: this.api && this.api.client,
                fastify: this,
                fetch,
              },
            )
          },
        )
        fastify.get(`/-/payload${url}`, async function (req, reply) {
          return getPayload({
            req,
            params: req.params,
            reply,
            $api: this.api && this.api.client,
            fastify: this,
            fetch,
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

  fastify.vite.commands = async () => {
    await fastify.ready()
    if (fastify.vite.options.eject) {
      const force = process.argv.includes('--force')
      await Promise.all(
        renderer.blueprint.map(async blueprintFile => {
          if (force || !existsSync(resolve(options.root, blueprintFile))) {
            const filePath = resolve(options.root, blueprintFile)
            const fileDir = parse(filePath).dir
            try {
              await ensureDir(fileDir)
              await writeFile(
                filePath,
                await readFile(resolve(renderer.path, 'base', blueprintFile)),
              )
            } catch {
              throw new Error(`failed to eject file: ${blueprintFile} to ${filePath}`)
            }
            console.log(`ℹ ejected ${filePath}.`)
          }
        }),
      )
      process.exit(0)
    }
    if (fastify.vite.options.generate.enabled || fastify.vite.options.generate.server.enabled) {
      const { generated } = fastify.vite.options.generate
      const paths = []
      if (typeof fastify.vite.options.generate.paths === 'function') {
        await fastify.vite.options.generate.paths(fastify, (path) => paths.push(path))
      } else if (Array.isArray(fastify.vite.options.generate.paths)) {
        paths.push(...fastify.vite.options.generate.paths)
      } else {
        paths.push(
          ...routes
            .filter(({ path }) => matchit.parse(path).every(segment => segment.type === 0))
            .map(({ path }) => path),
        )
      }

      await Promise.all(paths.map(async path => {
        const result = await generateRoute(fastify.inject({ url: path }), path, options)
        if (result) {
          generated(fastify, result, fastify.vite.options.distDir)
        }
      }))
      if (fastify.vite.options.generate.done) {
        await fastify.vite.options.generate.done(fastify)
      }
      if (!fastify.vite.options.generate.server.enabled) {
        setImmediate(() => {
          process.exit(0)
        })
      }
    }

    if (fastify.vite.options.generate.server.enabled) {
      const { generated } = fastify.vite.options.generate
      const { port } = fastify.vite.options.generate.server
      const builder = Fastify()
      builder.get('*', async (req, reply) => {
        const path = req.raw.url
        const result = await generateRoute(fastify.inject({ url: path }), path, options)
        if (result) {
          reply.send(`ℹ regenerated ${req.raw.url}`)
          generated(fastify, result, fastify.vite.options.distDir)
        }
      })
      // @Matteo
      //
      // FIXME Unresolved Promise used here just to prevent
      // execution from advancing into the .listen() call
      //
      // Fastify Core Idea: render .listen() ineffective
      // in case any of the registered onReady hooks returns false
      await new Promise(() => {
        builder.listen(port, (err, address) => {
          if (err) {
            console.error(err)
            setImmediate(() => {
              process.exit(1)
            })
          }
          console.log(`ℹ generate server listening on ${address}`)
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
