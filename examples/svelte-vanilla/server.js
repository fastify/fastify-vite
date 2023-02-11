import { fileURLToPath } from 'node:url'
import Fastify from 'fastify'
import FastifyVite from '@fastify/vite'

export async function main (dev) {
  const server = Fastify()
  const root = import.meta.url

  await server.register(FastifyVite, { 
    dev: dev || process.argv.includes('--dev'),
    root,
    createRenderFunction ({ Page }) {
      return () => {
        const { html: element } = Page.render()
        return { element }
      }
    }
  })

  server.get('/', (req, reply) => {
    reply.html(reply.render())
  })

  await server.vite.ready()

  return server
}

if (process.argv[1] === fileURLToPath(new URL(import.meta.url))) {
  const server = await main()
  await server.listen({ port: 3000 })
}
