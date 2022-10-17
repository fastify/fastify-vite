import Fastify from 'fastify'
import FastifyVite from 'fastify-vite'
import renderer from './renderer.js'

export async function main (dev) {
  const server = Fastify()
  const root = import.meta.url
  
  await server.register(FastifyVite, { dev, root, renderer })

  server.setErrorHandler((err, req, reply) => {
    console.error(err)
    reply.send(err)
  })

  await server.vite.ready()

  return server
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const server = await main()
  await server.listen({ port: 3000 })
}
