const Fastify = require('fastify')
const fastifyVite = require('../../index.js')

async function main (dev) {
  const server = Fastify()

  await server.register(fastifyVite, {
    dev,
    root: __dirname,
    createRenderFunction () {
      return () => {}
    },
  })

  await server.vite.ready()

  return server
}

module.exports = { main }
