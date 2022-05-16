import Fastify from 'fastify'
import FastifyVite from 'fastify-vite'
import { renderToString } from '@vue/server-renderer'

const server = Fastify()
const root = import.meta.url

await server.register(FastifyVite, { 
  root, 
  async createRenderFunction ({ createApp }) {
    return async () => {
      element: await renderToString(createApp())
    }
  }
})

await server.vite.ready()

server.get('/', async (req, reply) => {
  reply.html(await reply.render())
})

await server.listen(3000)
