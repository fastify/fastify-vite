#!/usr/bin/env node

import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import Fastify from 'fastify'
import FastifyPlugin from 'fastify-plugin'
import FastifyVite from '@fastify/vite'

import {
  resolveImportPath, 
  resolveOptions, 
  getIndexHtml,
  createServer
} from './slidev.js'

export async function main (dev) {
  const server = Fastify()

  await server.register(async function (scope) {
    const entry = 'slides-a/slides.md'
    const slidevOptions = await resolveOptions({ entry }, 'dev')

    await scope.register(FastifyVite, {
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

    scope.get('/a', (_, reply) => reply.html())

    await scope.vite.ready()
  })

  // await server.register(async function (scope) {
  //   const entry = 'slides-b/slides.md'
  //   const slidevOptions = await resolveOptions({ entry }, 'dev')

  //   await scope.register(FastifyVite, {
  //     root: dirname(resolveImportPath('@slidev/client/package.json', true)),
  //     prepareHtml: () => getIndexHtml(slidevOptions),
  //     server: (options) => {
  //       return createServer(slidevOptions, {
  //         ...options,
  //         root: slidevOptions.roots[0],
  //       })
  //     },
  //     dev: dev || process.argv.includes('--dev'),
  //     spa: true,
  //   })

  //   scope.get('/b', (_, reply) => reply.html())
  
  //   await scope.vite.ready()
  // })

  server.setErrorHandler((error, _, reply) => {
    console.error(error)
    reply.send(error)
  })

  return server
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const server = await main()
  await server.listen({ port: 3000 })
}
