const { resolve } = require('path')
const { renderDevHTMLTemplate, renderHTMLTemplate } = require('./html')

function getHandler (options, getRenderer, viteDevServer) {
  return async function (req, reply) {
    try {
      const url = req.raw.url
      const render = await getRenderer(url, viteDevServer)
      const fragments = await render(req, url, options)

      reply.code(200)
      reply.type('text/html')
      if (options.dev) {
        try {
          reply.send(await renderDevHTMLTemplate(req, fragments, viteDevServer))
        } catch (err) {
          console.log('renderDevHTMLTemplate error')
          console.error(err)
        }
      } else {
        reply.send(renderHTMLTemplate(req, fragments, options.distIndex))
      }

      return reply
    } catch (e) {
      if (viteDevServer) {
        viteDevServer.ssrFixStacktrace(e)
      }
      console.error(e.stack)
      reply.code(500)
      reply.send(e.stack)
    }
  }
}

function getRenderGetter ({ dev, root, entry, distDir, distIndex }) {
  if (dev) {
    return async (url, vite) => {
      // Reload template source every time in dev
      const { render } = await vite.ssrLoadModule(
        resolve(root, entry.server.replace(/^\/+/, '')),
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
