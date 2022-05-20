import Fastify from 'fastify'
import FastifyVite from 'fastify-vite'

const server = Fastify()
const root = import.meta.url

await server.register(FastifyVite, { 
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
await server.listen(3000)
