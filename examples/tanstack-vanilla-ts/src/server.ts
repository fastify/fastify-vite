import { resolve } from 'node:path'
import Fastify from 'fastify'
import FastifyVite from '@fastify/vite'
import * as renderer from '@fastify/tanstack'

export async function main(dev?: boolean) {
  const server = Fastify()

  await server.register(FastifyVite, {
    root: resolve(import.meta.dirname, '..'),
    dev: dev || process.argv.includes('--dev'),
    renderer,
  })

  await server.vite.ready()
  return server
}

if (process.argv[1] === import.meta.filename) {
  const server = await main()
  await server.listen({ port: 3000 })
}
