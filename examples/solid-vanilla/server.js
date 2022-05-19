import Fastify from 'fastify'
import FastifyVite from 'fastify-vite'
import { renderToStringAsync } from 'solid-js/web'

const server = Fastify()
const root = import.meta.url

await server.register(FastifyVite, { 
  root, 
  createRenderFunction ({ createApp }) {
    return async () => {
      return {
        element: await renderToStringAsync(createApp())
      }
    }
  }
})

server.get('/', async (req, reply) => {
  reply.html(await reply.render())
})

await server.vite.ready()
await server.listen(3000)
