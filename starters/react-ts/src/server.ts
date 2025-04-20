import { resolve } from 'node:path'
import Fastify from 'Fastify'
import FastifyVite from '@fastify/vite'

async function getServer (dev: boolean | undefined) {
  const server = Fastify()

  await server.register(FastifyVite, {
    dev: process.argv.includes('--dev') ?? dev,
    root: resolve(import.meta.dirname, '..'),
    renderer: '@fastify/react',
  })

  await server.vite.ready()

  return server
}

if (process.argv[1] === import.meta.filename) {
  const server = await getServer()
  await server.listen({ port: 3000 })
}
