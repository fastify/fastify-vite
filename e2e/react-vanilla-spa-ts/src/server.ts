import { resolve } from 'node:path'
import Fastify from 'fastify'
import FastifyVite from '@fastify/vite'

export async function main(dev?: boolean) {
  const server = Fastify()

  await server.register(FastifyVite, {
    // The compiled server will live in <root>/build which is the same depth as <root>/src,
    // so we can use import.meta.dirname here
    root: resolve(import.meta.dirname, '..'),
    dev: dev || process.argv.includes('--dev'),
    spa: true,
  })

  server.get('/', (req, reply) => {
    return reply.html()
  })

  await server.vite.ready()
  return server
}

if (process.argv[1] === import.meta.filename) {
  const server = await main()
  await server.listen({ port: 3000 })
}
