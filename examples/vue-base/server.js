const fastify = require('fastify')()
const fastifyVite = require('fastify-vite')
const fastifyViteVue = require('fastify-vite-vue')

async function main () {
  await fastify.register(fastifyVite, {
    root: __dirname,
    renderer: fastifyViteVue,
    build: process.argv.includes('build'),
  })
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
