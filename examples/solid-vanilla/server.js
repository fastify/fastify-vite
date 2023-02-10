import Fastify from 'fastify'
import FastifyVite from '@fastify/vite'
import { join } from 'node:path'
import { renderToStringAsync } from 'solid-js/web'

export async function main (dev) {
  const server = Fastify()

  await server.register(FastifyVite, {
    root: import.meta.url,
    dev: dev || process.argv.includes('--dev'),
    createRenderFunction ({ createApp }) {
      return async () => {
        return {
          element: await renderToStringAsync(createApp()),
        }
      }
    }
  })

  server.get('/', async (req, reply) => {
    reply.html(await reply.render())
  })

  await server.vite.ready()
  return server
}

if (process.argv[1] === join(process.cwd(), 'server.js')) {
  const server = await main()
  await server.listen({ port: 3000 })
}
