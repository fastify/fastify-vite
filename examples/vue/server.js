const fastify = require('fastify')()
const fastifyVite = require('fastify-vite')
const fastifyApi = require('fastify-api')

async function main() {
  await fastify.register(fastifyApi)
  await fastify.register(fastifyVite, {
    api: true,
    root: __dirname,
<<<<<<< HEAD:examples/vue/react/server.js
    renderer: fastifyVite.react,
    entry: {
      client: '/entry/client.jsx',
      server: '/entry/server.jsx'
    },
=======
    renderer: fastifyVite.vue
>>>>>>> eff058a2c157c5555278ea0d9b85a15a579acf81:examples/vue/server.js
  })


  fastify.api(({ get }) => ({
    echo: get('/echo/:msg', ({ msg }, req, reply) => {
      reply.send({ msg: msg + 'hit server' })
    }),
    other: get('/other', (req, reply) => {
      reply.send('string response')
    })
  }))

  fastify.get('/favicon.ico', (_, reply) => {
    reply.code(404)
    reply.send('')
  })
  fastify.vite.get('/hello', {
    data(req) {
      return { message: `Hello from ${req.raw.url} - ${Math.random()}` }
    }
  })

  fastify.vite.get('/*')

  return fastify
}

if (require.main === module) {
  fastifyVite.app(main, (fastify) => {
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
