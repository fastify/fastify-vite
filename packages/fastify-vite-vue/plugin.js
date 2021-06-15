const { readFileSync } = require('fs')
const { resolve } = require('path')

const clientSource = readFileSync(resolve(__dirname, 'client.js'), 'utf8')

module.exports = () => ({
  resolveId (id) {
    if (id === '@fastify-vite-vue/client') {
      return '@fastify-vite-vue/client'
    }
  },
  load (id) {
    if (id === '@fastify-vite-vue/client') {
      return clientSource
    }
  },
})
