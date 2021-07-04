const { renderDevHTMLTemplate, renderHTMLTemplate } = require('./html')

function getHandler (options, render) {
  return async function (req, reply) {
    try {
      const url = req.raw.url
      const fragments = await render(req, url, options)

      reply.code(200)
      reply.type('text/html')
      reply.send(renderHTMLTemplate(req, fragments, options.distIndex))

      return reply
    } catch (e) {
      reply.code(500)
      reply.send(e.stack)
    }
  }
}

function getDevHandler (options, getRender, viteDevServer) {
  return async function (req, reply) {
    try {
      const url = req.raw.url
      const fragments = await getRender(req, url, options)

      reply.code(200)
      reply.type('text/html')
      reply.send(await renderDevHTMLTemplate(req, fragments, viteDevServer))

      return reply
    } catch (e) {
      viteDevServer.ssrFixStacktrace(e)
      console.error(e.stack)
      reply.code(500)
      reply.send(e.stack)
    }
  }
}

module.exports = { getHandler, getDevHandler }
