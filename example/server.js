const fastify = require('fastify')()
const fastifyVite = require('../index')

async function main () {
  await fastify.register(fastifyVite, {
    dev: process.env.NODE_ENV !== 'production',
    rootDir: resolve => resolve(__dirname),
    clientEntryPath: '/entry/client.js',
    serverEntryPath: '/entry/server.js',
  })

  fastify.get('/favicon.ico', (_, reply) => reply.code(404))
  fastify.vite.get('/hello', {
    ssrData (req) {
      return { message: `Hello from ${req.raw.url} - ${Math.random()}` }
    }
  })

  fastify.get('/*', fastify.vite.handler)
  return fastify
}

if (require.main === module) {
  main().then((fastify) => {
    fastify.listen(3000, (err, address) => {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      console.log(`Server listening on ${address}`)
    })
  })
}

module.exports = main
