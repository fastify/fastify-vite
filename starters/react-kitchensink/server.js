import Fastify from 'fastify'
import FastifyVite from '@fastify/vite'

const server = Fastify({
  logger: {
    transport: {
      target: '@fastify/one-line-logger'
    }
  }
})

await server.register(FastifyVite, { 
  root: import.meta.url, 
  renderer: '@fastify/react',
})

await server.vite.ready()

server.decorate('db', {
  todoList: [
    'Do laundry',
    'Respond to emails',
    'Write report',
  ]
})

server.put('/api/todo/items', (req, reply) => {
  server.db.todoList.push(req.body)
  reply.send({ ok: true })
})

server.delete('/api/todo/items', (req, reply) => {
  server.db.todoList.splice(req.body, 1)
  reply.send({ ok: true })
})

await server.listen({ port: 3000 })
