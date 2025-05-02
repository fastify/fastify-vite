import { fileURLToPath } from 'node:url'
import Fastify from 'fastify'
import FastifyVite from '@fastify/vite'
import renderer from './renderer.js'

export async function main(dev) {
  const server = Fastify({
    logger: {
      transport: {
        target: '@fastify/one-line-logger',
      },
    },
  })

  await server.register(FastifyVite, {
    root: import.meta.dirname,
    renderer,
  })

  await server.vite.ready()

  return server
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const server = await main()
  await server.listen({ port: 3000 })
}
