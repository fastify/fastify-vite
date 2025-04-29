#!/usr/bin/env node
import { fileURLToPath } from 'node:url'
import Fastify from 'fastify'
import FastifyVite from '@fastify/vite'
import renderer from './renderer.js'
import ky from 'ky-universal'

export async function main (dev) {
  const server = Fastify({ logger: true, ignoreTrailingSlash: true })

  server.decorate('ky', ky.create({
    prefixUrl: 'http://localhost:3000/',
  }))

  server.get('/api/todo-list', (_, reply) => {
    reply.send([
      'Do laundry',
      'Respond to emails',
      'Write report',
    ])
  })

  server.setErrorHandler((err, req, reply) => {
    console.error(err)
    reply.code(500)
    reply.send(err)
  })

  await server.register(FastifyVite, {
    dev: dev || process.argv.includes('--dev'),
    root: import.meta.url,
    renderer
  })

  await server.vite.ready()

  return server
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const server = await main()
  await server.listen({ port: 3000 })
}
