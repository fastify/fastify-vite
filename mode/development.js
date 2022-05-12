const middie = require('middie')
const { createServer } = require('vite')
const { join, resolve, read } = require('../ioutils')

async function setup (options) {
  // Vite's pesky opinionated constraint of having index.html
  // as the main entry point for bundling — the file needs to exist
  const indexHtmlPath = join(options.vite.root, 'index.html')

  // Middie seems to work well for running Vite's development server
  // Unsure if fastify-express is warranted here
  await this.scope.register(middie)

  // Create and enable Vite's Dev Server middleware
  const devServerOptions = {
    configFile: options.viteConfig,
    server: {
      middlewareMode: 'ssr',
      ...options.vite.server,
    },
  }
  this.devServer = await createServer(devServerOptions)
  this.scope.use(this.devServer.middlewares)

  // In development mode, template is passed as an async function, which is
  // called on every request to ensure the newest index.html version is loaded
  const getTemplate = async (url) => {
    const indexHtml = await read(indexHtmlPath, 'utf8')
    const transformedHtml = await this.devServer.transformIndexHtml(url, indexHtml)
    return await options.compileIndexHtml(transformedHtml)
  }

  const { getHandler, createRenderFunction } = Object.assign({ getHandler: _getHandler }, options)
  const { routes, render: getRender } = await loadServerEntry(options, createRenderFunction, this.devServer)

  this.scope.decorateReply('render', render)
  this.scope.decorateReply('html', await createHtmlFunction(options.bundle.indexHtml))

  const handler = getHandler(this.scope, options, getRender, getTemplate, this.devServer)

  return { routes, handler }

  // Loads the Vite application server entry.
  // loadServerEntry() must produce an object with a render function and
  // optionally, a routes array. The official adapters will
  // automatically load view files from the views/ folder and
  // provide them in the routes array. The routes array is then used
  // to register an individual Fastify route for each of the views.
  async function loadServerEntry (options, createRenderFunction, devServer) {
    const modulePath = resolve(options.vite.root, options.serverEntryPoint.replace(/^\/+/, ''))
    const entryModule = await devServer.ssrLoadModule(modulePath)
    let entry = entryModule.default ?? entryModule
    if (typeof entry === 'function') {
      entry = entry(createRenderFunction)
    }
    return {
      routes: typeof entry.routes === 'function'
        ? await entry.routes()
        : entry.routes,
      // In development mode, render is an async function so it
      // can always return the freshest version of the render
      // function exported by the Vite application server entry
      async render () {
        const entryModule = await devServer.ssrLoadModule(modulePath)
        let entry = entryModule.default ?? entryModule
        if (typeof entry === 'function') {
          entry = entry(createRenderFunction)
        }
        const { render } = entry.default ?? entry
        return render
      },
    }
  }

  // Creates a route handler function set up for integration with
  // the Vite Dev Server and hot reload of index.html
  function _getHandler (scope, options, getRenderApp, getRenderIndexHtml, viteDevServer) {
    return async function (req, reply) {
      try {
        const renderApp = await getRenderApp()
        const url = req.raw.url
        const renderIndexHtml = await getRenderIndexHtml(url)
        const indexHtmlContext = await renderApp(scope, req, reply, url, options)
        reply.type('text/html')
        indexHtmlContext.fastify = scope
        indexHtmlContext.req = req
        indexHtmlContext.reply = reply
        reply.send(renderIndexHtml(indexHtmlContext))
        return reply
      } catch (error) {
        viteDevServer.ssrFixStacktrace(error)
        // Propagate the error to the Fastify instance's error handler
        throw error
      }
    }
  }
}

module.exports = { setup }
