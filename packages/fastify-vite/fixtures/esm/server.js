import { createRequire } from 'node:module'
import Fastify from 'fastify'

const require = createRequire(import.meta.url)
const fastifyVite = require('../../index.js')

export async function main(dev) {
  const server = Fastify()

  await server.register(fastifyVite, {
    dev,
    root: import.meta.url,
  })

  await server.vite.ready()

  return server
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const server = await main(process.argv.includes('--dev'))
  await server.listen({ port: 3000 })
}