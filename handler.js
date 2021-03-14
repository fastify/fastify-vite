const { resolve } = require('path')
const renderHTMLTemplate = require('./html')

function getHandler (options, getRenderer, viteDevServer) {
  return async function (req, reply) {
    try {
      const url = req.raw.url
      const render = await getRenderer(url, viteDevServer)
      const fragments = await render(req, url, options)
      const html = renderHTMLTemplate(req, fragments)

      reply.code(200)
      reply.type('text/html')
      reply.send(html)

      return reply
    } catch (e) {
      console.error(e.stack)
      if (viteDevServer) {
        viteDevServer.ssrFixStacktrace(e)
      }
      reply.code(500)
      reply.send(e.stack)
    }
  }
}

function getRenderGetter ({ dev, rootDir, srcDir, serverEntryPath, distDir, distIndex }) {
  if (dev) {
    return async (url, viteDevServer) => {
      // Reload template source every time in dev
      const { render } = await viteDevServer.ssrLoadModule(
        resolve(rootDir, serverEntryPath.replace(/^\/+/, ''))
      )
      return render
    }
  } else {
    // Load production template source only once in prod
    const { render } = require(resolve(distDir, 'server/server.js'))
    return () => render
  }
}

module.exports = { getHandler, getRenderGetter }
