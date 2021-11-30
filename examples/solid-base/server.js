const Fastify = require('fastify')
const FastifyVite = require('fastify-vite')
const FastifyViteSolid = require('fastify-vite-solid')

async function main () {
  const app = Fastify()
  await app.register(FastifyVite, {
    root: __dirname,
    renderer: FastifyViteSolid,
  })
  await app.vite.commands()
  return app
}

if (require.main === module) {
  main().then((app) => {
    app.listen(3000, (err, address) => {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      console.log(`Server listening on ${address}`)
    })
  })
}

module.exports = main
