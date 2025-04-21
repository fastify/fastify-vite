import { resolve } from 'node:path'
import Fastify from 'fastify'
import FastifyVite from '@fastify/vite'
import { renderToString } from 'vue/server-renderer'

export async function main (dev?: boolean) {
  const server = Fastify()

  await server.register(FastifyVite, {
    // The compiled server will live in <root>/build
    // which is the same depth as <root>/src, so 
    // we can use import.meta.dirname here
    root: resolve(import.meta.dirname, '..'),
    distDir: resolve(import.meta.dirname, '..', 'build'),
    dev: dev || process.argv.includes('--dev'),
    // @ts-ignore
    async createRenderFunction ({ createApp }) {
      return async () => ({
        // @ts-ignore
        element: await renderToString(createApp())
      })
    }
  })

  server.setErrorHandler((err, req, reply) => {
    console.error(err)
    reply.send(err)
  })

  await server.vite.ready()

  server.get('/', (req, reply) => {
    return reply.html()
  })

  return server
}

if (process.argv[1] === import.meta.filename) {
  const server = await main()
  await server.listen({ port: 3000 })
}
