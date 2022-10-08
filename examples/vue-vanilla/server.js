import Fastify from 'fastify'
import FastifyVite from 'fastify-vite'
import { createServer } from 'vite'

import { dirname, resolve } from 'path'
const __dirname = dirname(new URL(import.meta.url).pathname)

async function main () {
  const server = Fastify()

  await server.register(FastifyVite, { 
    createServer,    
    root: import.meta.url,
    async createRenderFunction ({ createApp }) {
      return async () => ({
        element: '', // await renderToString(createApp())
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

  await server.listen(3000)
}

main()
