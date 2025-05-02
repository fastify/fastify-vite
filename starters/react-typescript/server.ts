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

await server.register(FastifyFormBody)

await server.register(FastifyVite, {
  // TODO handle via CLI path argument with proper resolve
  root: process.cwd(),
  renderer: import.meta.resolve('@fastify/react'),
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
