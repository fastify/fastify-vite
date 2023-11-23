import Fastify from 'fastify'
import FastifyVite from '@fastify/vite'
import FastifyReact from '@fastify/react'

const server = Fastify()

await server.register(FastifyVite, { 
  // This is in fact the default behavior
  // from @fastify/vite for enabling Vite's 
  // development server, but it is explictly shown
  // here in case you need it to be enabled differently.
  dev: process.argv.includes('--dev'),
  // The location of your Vite configuration file
  root: import.meta.url, 
  // The Fastify DX renderer for @fastify/vite
  renderer: FastifyReact,
})

// This ensures Vite's development server
// is properly initialized when dev mode is enabled.
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
