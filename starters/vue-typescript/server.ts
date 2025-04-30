
import Fastify from 'fastify'
import FastifyVite from '@fastify/vite'
import FastifyFormBody from '@fastify/formbody'

interface Database {
  todoList: string[]
}

const server = Fastify({
  logger: {
    transport: {
      target: '@fastify/one-line-logger'
    }
  }
})

// @ts-ignore TODO
await server.register(FastifyFormBody)

await server.register(FastifyVite, {
  root: import.meta.dirname,
  renderer: '@fastify/vue',
})

await server.vite.ready()

server.decorate<Database>('db', {
  todoList: [
    'Do laundry',
    'Respond to emails',
    'Write report',
  ]
})

server.put<{
  Body: string
}>('/api/todo/items', (req, reply) => {
  const db = server.getDecorator<Database>('db')
  db.todoList.push(req.body)
  reply.send({ ok: true })
})

server.delete<{
  Body: number
}>('/api/todo/items', (req, reply) => {
  const db = server.getDecorator<Database>('db')
  db.todoList.splice(req.body, 1)
  reply.send({ ok: true })
})

await server.listen({ port: 3000 })
