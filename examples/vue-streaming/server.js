import Fastify from 'fastify'
import FastifyVite from '@fastify/vite'
import { createReadStream } from 'fs'
import renderer from './renderer.js'
import { resolve } from 'path'

export async function main (dev) {
  const server = Fastify()
  const root = import.meta.url
  
  await server.register(FastifyVite, {
    dev: dev || process.argv.includes('--dev'),
    root,
    renderer
  })

  server.setErrorHandler((err, req, reply) => {
    console.error(err)
    reply.send(err)
  })

  await server.vite.ready()

  server.get('/something', (req, reply) => {
    reply.send(createReadStream(resolve('./server.js')))
  })

  return server
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const server = await main()
  await server.listen({ port: 3000 })
}
