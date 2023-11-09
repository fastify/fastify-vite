#!/usr/bin/env node
import { fileURLToPath } from 'node:url'
import Fastify from 'fastify'
import FastifyVite from '@fastify/vite'
import { renderToString } from 'vue/server-renderer'

console.log('FastifyVite', FastifyVite)

export async function main (dev) {
  const server = Fastify()

  await server.register(FastifyVite, { 
    root: import.meta.url,
    dev: dev || process.argv.includes('--dev'),
    async createRenderFunction ({ createApp }) {
      return async () => ({
        element: await renderToString(createApp())
      })
    }
  })

  server.setErrorHandler((err, req, reply) => {
    console.error(err)
    reply.send(err)
  })

  await server.vite.ready()

  server.get('/', async (req, reply) => {
    reply.html(await reply.render())
  })

  return server
}

if (process.argv[1] === fileURLToPath(new URL(import.meta.url))) {
  const server = await main()
  await server.listen({ port: 3000 })
}
