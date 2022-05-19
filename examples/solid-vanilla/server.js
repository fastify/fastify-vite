import Fastify from 'fastify'
import FastifyVite from 'fastify-vite'
import { renderToStringAsync } from 'solid-js/web'

const server = Fastify()
const root = import.meta.url

await server.register(FastifyVite, { 
  root, 
  createRenderFunction ({ createApp }) {
    return () => {
      return {
        element: renderToStringAsync(createApp())
      }
    }
  }
})

server.get('/', (req, reply) => {
  reply.html(reply.render())
})

await server.vite.ready()
await server.listen(3000)
