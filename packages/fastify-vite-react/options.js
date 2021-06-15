// const reactRefresh = require('@vitejs/plugin-react-refresh')
const reactRefresh = require('./plugin')

const dev = process.env.NODE_ENV !== 'production'

const options = {
  // Vite's logging level
  logLevel: dev ? 'error' : 'info',
  // Vite plugins needed for Vue 3 SSR to fully work
  plugins: [
    reactRefresh(),
  ],
  esbuild: {
    jsxInject: 'import React from \'react\';',
  },
  // Base build settings, default values
  // for assetsDir and outDir match Vite's defaults
  build: {
    assetsDir: 'assets',
    outDir: 'dist',
    minify: !dev,
  },
  watch: {
    // During tests we edit the files too fast and sometimes chokidar
    // misses change events, so enforce polling for consistency
    usePolling: true,
    interval: 100,
  },
}

module.exports = { options }
