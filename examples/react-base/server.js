const fastify = require('fastify')()
const fastifyVite = require('fastify-vite')
const fastifyViteReact = require('fastify-vite-react')

async function main () {
  await fastify.register(fastifyVite, {
    root: __dirname,
    renderer: fastifyViteReact,
  })
  await fastify.vite.ready()
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
