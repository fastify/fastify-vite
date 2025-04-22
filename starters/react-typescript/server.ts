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

// @ts-ignore
await server.register(FastifyFormBody)
// @ts-ignore
await server.register(FastifyVite, {
  // TODO handle via CLI path argument with proper resolve
  root: process.cwd(),
  renderer: '@fastify/react',
})

// @ts-ignore
await server.vite.ready()

server.decorate('db', {
  todoList: [
    'Do laundry',
    'Respond to emails',
    'Write report',
  ]
})

server.put('/api/todo/items', (req, reply) => {
  // @ts-ignore
  server.db.todoList.push(req.body)
  reply.send({ ok: true })
})

server.delete('/api/todo/items', (req, reply) => {
  // @ts-ignore
  server.db.todoList.splice(req.body, 1)
  reply.send({ ok: true })
})

await server.listen({ port: 3000 })
