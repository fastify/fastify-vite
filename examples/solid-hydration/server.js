#!/usr/bin/env node
import { fileURLToPath } from 'node:url'
import Fastify from 'fastify'
import FastifyVite from '@fastify/vite'

import { createRenderFunction } from './renderer.js'

export async function main (dev) {
  const server = Fastify()

  await server.register(FastifyVite, {
    root: import.meta.url,
    dev: dev || process.argv.includes('--dev'),
    createRenderFunction
  })

  await server.vite.ready()

  return server
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const server = await main()
  await server.listen({ port: 3000 })
}
