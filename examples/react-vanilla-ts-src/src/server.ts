
import Fastify from 'fastify'
import FastifyVite from '@fastify/vite'
import { renderToString } from 'react-dom/server'
import { join } from 'path'

export async function main (dev?: boolean) {
  const server = Fastify()

  const root = join(import.meta.dirname, '..')
  await server.register(FastifyVite, {
    root,
    dev: dev || process.argv.includes('--dev'),
    async createRenderFunction ({ createApp }: { createApp: () => React.ReactNode  }) {
      return () => {
        return {
          element: renderToString(createApp()),
        }
      }
    }
  })

  server.get('/', (req, reply) => {
    return reply.html()
  })

  await server.vite.ready()
  return server
}

if (process.argv[1] === import.meta.filename) {
  const server = await main()
  await server.listen({ port: 3000 })
}
