import Fastify from 'fastify'
import fastifyVite from '../../src/index.ts'

export async function main(dev, opts = {}) {
  const server = Fastify()

  await server.register(fastifyVite, {
    dev,
    root: import.meta.dirname,
    ...opts,
  })

  await server.vite.ready()

  return server
}

if (process.argv[1] === import.meta.filename) {
  const server = await main(process.argv.includes('--dev'))
  await server.listen({ port: 3000 })
}
