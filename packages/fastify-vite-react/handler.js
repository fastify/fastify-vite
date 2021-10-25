function getHandler (fastify, options, render, template) {
  return async function (req, reply) {
    try {
      const url = req.raw.url
      const fragments = await render(fastify, req, reply, url, options)
      reply.type('text/html')
      reply.send(template(req, fragments))
    } catch (e) {
      reply.code(500)
      reply.send(e.stack)
    }
  }
}

function getDevHandler (fastify, options, getRender, getTemplate, viteDevServer) {
  return async function (req, reply) {
    try {
      const url = req.raw.url
      const render = await getRender()
      const template = await getTemplate()
      const fragments = await render(fastify, req, reply, url, options)
      reply.type('text/html')
      reply.send(template(req, fragments))
    } catch (e) {
      viteDevServer.ssrFixStacktrace(e)
      console.error(e.stack)
      reply.code(500)
      reply.send(e.stack)
    }
  }
}

module.exports = { getHandler, getDevHandler }
