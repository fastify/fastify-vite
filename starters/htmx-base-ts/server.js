import Fastify from 'fastify'
import FastifyVite from '@fastify/vite'
import FastifyFormBody from '@fastify/formbody'

const server = Fastify({
  logger: {
    transport: {
      target: '@fastify/one-line-logger'
    }
  }
})

// Dummy authentication example used in views/using-layout.jsx
const session = { user: null }
server.decorateRequest('session', { getter: () => session })
server.post('/authenticate', (req, reply) => {
  req.session.user = true
  reply.header('HX-Redirect', req.headers.referer)
  reply.send('')
})

server.decorate('db', {
  todoList: [
    'Do laundry',
    'Respond to emails',
    'Write report',
  ]
})

await server.register(FastifyFormBody)
await server.register(FastifyVite, { 
  root: import.meta.url, 
  renderer: '@fastify/htmx',
})

await server.vite.ready()
await server.listen({ port: 3000 })
