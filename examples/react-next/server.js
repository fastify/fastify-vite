#!/usr/bin/env node
import { fileURLToPath } from 'node:url'

import Fastify from 'fastify'
import FastifyVite from '@fastify/vite'

// fetch() is natively available in Node.js v18
// This example gets it from undici so it can work on v16 as well
import { fetch } from 'undici'

import renderer from './renderer.js'

export async function main (dev) {
  const server = Fastify({ ignoreTrailingSlash: true })
  
  server.decorate('fetchJSON', async (path) => {
    const response = await fetch(`http://localhost:3000${path}`)
    return response.json()
  })
  
  server.get('/api/todo-list', (_, reply) => {
    reply.send([
      'Do laundry',
      'Respond to emails',
      'Write report'
    ])
  })

  server.setErrorHandler((err, req, reply) => {
    console.error(err)
    reply.code(500)
    reply.send(err)
  })

  await server.register(FastifyVite, {
    root: import.meta.url,
    dev: dev || process.argv.includes('--dev'),
    renderer
  })

  await server.vite.ready()

  return server
}

if (process.argv[1] === fileURLToPath(new URL(import.meta.url))) {
  const server = await main()
  await server.listen({ port: 3000 })
}
