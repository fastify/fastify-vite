const vuePlugin = require('@vitejs/plugin-vue')
const vueJsx = require('@vitejs/plugin-vue-jsx')
// const fastifyViteVuePlugin = require('./plugin')

const dev = process.env.NODE_ENV !== 'production'

const options = {
  entry: {
    // This differs from Vite's choice for its playground examples,
    // which is having entry-client.js and entry-server.js files on
    // the same top-level folder. For better organization fastify-vite
    // expects them to be grouped under /entry
    client: '/entry/client.js',
    server: '/entry/server.js',
  },
  vite: {
    // Vite's logging level
    logLevel: dev ? 'error' : 'info',
    // Vite plugins needed for Vue 3 SSR to fully work
    plugins: [
      vuePlugin(),
      vueJsx(),
      // fastifyViteVuePlugin(),
    ],
    // Base build settings, default values
    // for assetsDir and outDir match Vite's defaults
    build: {
      assetsDir: 'assets',
      outDir: 'dist',
      minify: !dev,
    },
  },
}

module.exports = { options }
