const { renderDevHTMLTemplate, renderHTMLTemplate } = require('./html')

function getHandler (fastify, options, render) {
  return async function (req, reply) {
    try {
      const url = req.raw.url
      const fragments = await render(fastify, req, reply, url, options)

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

function getDevHandler (fastify, options, getRender, viteDevServer) {
  return async function (req, reply) {
    try {
      const url = req.raw.url
      const render = await getRender()
      const fragments = await render(fastify, req, reply, url, options)

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
