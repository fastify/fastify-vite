
import Fastify from 'fastify'
import FastifyVite from 'fastify-vite'
import renderer from 'fastify-vite-vue'

async function main () {
  const app = Fastify()
  const root = import.meta.url

  await app.register(FastifyVite, { root, renderer })
  await app.vite.commands()

  return app
}

if (!process.argv.includes('test')) {
  const app = await main()
  const address = await app.listen(3000)
  console.log(`Listening at ${address}.`)
}

export default main
