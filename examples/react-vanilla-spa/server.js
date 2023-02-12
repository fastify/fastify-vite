#!/usr/bin/env node
import { fileURLToPath } from 'node:url'
import Fastify from 'fastify'
import FastifyVite from '@fastify/vite'

export async function main (dev) {
  const server = Fastify()

  await server.register(FastifyVite, {
    root: import.meta.url,
    dev: dev || process.argv.includes('--dev'),
    spa: true
  })

  server.get('/', (req, reply) => {
    reply.html()
  })

  await server.vite.ready()
  return server
}

if (process.argv[1] === fileURLToPath(new URL(import.meta.url))) {
  const server = await main()
  await server.listen({ port: 3000 })
}
