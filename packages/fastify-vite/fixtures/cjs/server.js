const Fastify = require('fastify')
const fastifyVite = require('../../index.js')

async function main(dev) {
  const server = Fastify()

  await server.register(fastifyVite, {
    dev,
    root: __dirname,
  })

  await server.vite.ready()

  return server
}

module.exports = { main }

if (process.argv[1] === __filename) {
  main(process.argv.includes('--dev')).then((server) =>
    server.listen({ port: 3000 }),
  )
}
