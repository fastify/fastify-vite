const fastify = require('fastify')()
const fastifyVite = require('fastify-vite')
const fastifyApi = require('fastify-api')

async function main () {
  await fastify.register(fastifyApi)
  await fastify.register(fastifyVite, {
    api: true,
    dev: process.env.NODE_ENV !== 'production',
    rootDir: resolve => resolve(__dirname),
    clientEntryPath: '/entry/client.js',
    serverEntryPath: '/entry/server.js',
  })

  fastify.api(({ get }) => ({
    echo: get('/echo/:msg', ({ msg }, req, reply) => {
      reply.send({ msg })
    }),
    other: get('/other', (req, reply) => {
      reply.send('string response')
    }),
  }))

  fastify.vite.global = { prop: 'data' }

  fastify.get('/favicon.ico', (_, reply) => {
    reply.code(404)
    reply.send('')
  })
  fastify.vite.get('/hello', {
    data (req) {
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
