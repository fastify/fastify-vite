import Fastify from 'fastify'
import FastifyVite from '@fastify/vite'

export async function main(dev) {
  const server = Fastify()

  await server.register(FastifyVite, {
    root: import.meta.dirname,
    dev: dev ?? process.argv.includes('--dev'),
    spa: true,
    fastifyStaticOptions: {
      preCompressed: true,
      setHeaders(res) {
        res.setHeader('X-Custom-Header', 'from-static-options')
      },
    },
  })

  server.get('/', (req, reply) => {
    return reply.html()
  })

  await server.vite.ready()
  return server
}

if (process.argv[1] === import.meta.filename) {
  const server = await main()
  await server.listen({ port: 3000 })
}
