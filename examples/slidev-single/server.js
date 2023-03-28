#!/usr/bin/env node

import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import Fastify from 'fastify'
import FastifyVite from '@fastify/vite'

import {
  resolveImportPath, 
  resolveOptions, 
  getIndexHtml,
  createServer
} from './slidev.js'

export async function main (dev) {
  const server = Fastify()

  const entry = 'slides/slides.md'
  const slidevOptions = await resolveOptions({ entry }, 'dev')

  await server.register(FastifyVite, {
    root: dirname(resolveImportPath('@slidev/client/package.json', true)),
    prepareHtml: () => getIndexHtml(slidevOptions),
    server: (options) => {
      return createServer(slidevOptions, {
        ...options,
        root: slidevOptions.roots[0],
      })
    },
    dev: dev || process.argv.includes('--dev'),
    spa: true,
  })

  server.get('/', async (req, reply) => {
    reply.html()
  })

  server.setErrorHandler((error, _, reply) => {
    console.error(error)
    reply.send(error)
  })

  await server.vite.ready()
  return server
}

if (process.argv[1] === fileURLToPath(new URL(import.meta.url))) {
  const server = await main()
  await server.listen({ port: 3000 })
}
