const vuePlugin = require('@vitejs/plugin-vue')
const vueJsx = require('@vitejs/plugin-vue-jsx')

const dev = process.env.NODE_ENV !== 'production'

module.exports = {
  // Vite's logging level
  logLevel: dev ? 'error' : 'info',
  // Vite plugins needed for Vue 3 SSR to fully work
  plugins: [
    vuePlugin(),
    vueJsx()
  ],
  // Base build settings, default values
  // for assetsDir and outDir match Vite's defaults
  build: {
    assetsDir: 'assets',
    outDir: 'dist',
    minify: !dev
  }
}
