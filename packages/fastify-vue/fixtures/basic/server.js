import Fastify from 'fastify'
import FastifyVite from '@fastify/vite'
import * as fastifyVue from '@fastify/vue'

export async function main(dev, opts = {}) {
  const server = Fastify()

  server.decorate('db', {
    todoList: ['Do laundry', 'Respond to emails', 'Write report'],
  })

  await server.register(FastifyVite, {
    root: import.meta.dirname,
    renderer: fastifyVue,
    dev,
    ...opts,
  })

  await server.vite.ready()

  return server
}

if (process.argv[1] === import.meta.filename) {
  const server = await main(process.argv.includes('--dev'))
  await server.listen({ port: 3000 })
}
