const reactRefresh = require('@vitejs/plugin-react-refresh')

const dev = process.env.NODE_ENV !== 'production'

const options = {
  // Vite's logging level
  logLevel: dev ? 'error' : 'info',
  // Vite plugins needed for Vue 3 SSR to fully work
  plugins: [
    reactRefresh()
  ],
  esbuild: {
    jsxInject: 'import React from \'react\';'
  },  
  // Base build settings, default values
  // for assetsDir and outDir match Vite's defaults
  build: {
    assetsDir: 'assets',
    outDir: 'dist',
    minify: !dev
  }
}

module.exports = { options }
