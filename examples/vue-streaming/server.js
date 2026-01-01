#!/usr/bin/env node
import { createReadStream } from 'node:fs'
import { resolve } from 'node:path'
import Fastify from 'fastify'
import FastifyVite from '@fastify/vite'
import renderer from './renderer.js'

export async function main(dev) {
  const server = Fastify()

  await server.register(FastifyVite, {
    dev: dev || process.argv.includes('--dev'),
    root: import.meta.dirname,
    renderer,
  })

  server.setErrorHandler((err, req, reply) => {
    console.error(err)
    reply.send(err)
  })

  await server.vite.ready()

  server.get('/something', (req, reply) => {
    reply.send(createReadStream(resolve('./server.js')))
  })

  return server
}

if (process.argv[1] === import.meta.filename) {
  const server = await main()
  await server.listen({ port: 3000 })
}
