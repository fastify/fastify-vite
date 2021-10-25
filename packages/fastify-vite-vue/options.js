const vite = require('./vite')

const options = {
  entry: {
    // This differs from Vite's choice for its playground examples,
    // which is having entry-client.js and entry-server.js files on
    // the same top-level folder. For better organization fastify-vite
    // expects them to be grouped under /entry
    client: '@app/entry/client',
    server: '@app/entry/server',
  },
  vite,
}

module.exports = { options }
