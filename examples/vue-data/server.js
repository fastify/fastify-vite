
import Fastify from 'fastify'
import FastifyAPI from 'fastify-api'
import FastifyVite from 'fastify-vite'
import renderer from 'fastify-vite-vue'

async function main () {
  const app = Fastify()
  const root = import.meta.url

  await app.register(FastifyAPI)
  await app.register(FastifyVite, { root, renderer })

  app.api(({ get }) => ({
    echo: get('/echo/:msg', ({ msg }, req, reply) => {
      reply.send({ msg })
    }),
    other: get('/other', (req, reply) => {
      reply.send('string response')
    }),
  }))

  app.vite.global = { foobar: 123 }

  await app.vite.ready()
  return app
}

if (!process.argv.includes('test')) {
  const app = await main()
  const address = await app.listen(3000)
  console.log(`Listening at ${address}.`)
}

export default main
