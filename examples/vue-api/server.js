const fastify = require('fastify')()
const fastifyVite = require('fastify-vite')
const fastifyViteVue = require('fastify-vite-vue')
const fastifyApi = require('fastify-api')

async function main () {
  await fastify.register(fastifyApi)
  await fastify.register(fastifyVite, {
    api: true,
    root: __dirname,
    renderer: fastifyViteVue,
  })

  fastify.api(({ get, post }) => ({
    echo: post('/echo/:msg', ({ msg }, req, reply) => {
      reply.send({ msg })
    }),
    other: get('/other', (req, reply) => {
      reply.send('string response')
    }),
  }))

  fastify.get('/favicon.ico', (_, reply) => {
    reply.code(404)
    reply.send('')
  })

  fastify.vite.global = { foobar: 123 }

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
