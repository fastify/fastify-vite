const { resolve } = require('path')
const { renderDevHTMLTemplate, renderHTMLTemplate } = require('./html')

function getHandler (options, getRenderer, vite) {
  return async function (req, reply) {
    try {
      const url = req.raw.url
      const render = await getRenderer(url, vite)
      const fragments = await render(req, url, options)
      const html = options.dev
        ? renderDevHTMLTemplate(req, fragments)
        : renderHTMLTemplate(req, fragments, options.distIndex)

      reply.code(200)
      reply.type('text/html')
      reply.send(html)

      return reply
    } catch (e) {
      console.error(e.stack)
      if (vite) {
        vite.ssrFixStacktrace(e)
      }
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
        resolve(root, entry.server.replace(/^\/+/, ''))
      )
      return render
    }
  } else {
    // Load production template source only once in prod
    const { render } = require(resolve(distDir, 'server/server.js'))
    return () => render
  }
}

module.exports = { getHandler, getRenderer }
