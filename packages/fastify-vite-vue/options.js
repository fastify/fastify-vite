const vuePlugin = require('@vitejs/plugin-vue')
const vueJsx = require('@vitejs/plugin-vue-jsx')
// const fastifyViteVuePlugin = require('./plugin')

const dev = process.env.NODE_ENV !== 'production'

const options = {
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
}

module.exports = { options }
