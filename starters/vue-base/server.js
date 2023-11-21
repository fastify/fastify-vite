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
  renderer: '@fastify/vue',
})

await server.vite.ready()
await server.listen({ port: 3000 })
