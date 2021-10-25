const viteReactRefresh = require('@vitejs/plugin-react-refresh')
const viteBlueprint = require('vite-plugin-blueprint')

const dev = process.env.NODE_ENV !== 'production'

module.exports = {
  // Vite's logging level
  logLevel: dev ? 'error' : 'info',
  ssr: {
    external: [
      'react',
      'react-router',
      'react-router-dom',
      'prop-types',
      'react-side-effect',
      'react-fast-compare',
      'object-assign',
    ],
  },
  esbuild: {
    jsxInject: 'import React from \'react\'\n',
  },
  plugins: [
    viteReactRefresh(),
    viteBlueprint({
      prefix: '@app/',
      root: resolve => resolve(__dirname, 'base'),
      files: [
        ['entry/client.jsx', [
          'entry-client.jsx',
          'client/entry.jsx',
          'client-entry.jsx',
        ]],
        ['entry/server.jsx', [
          'entry-server.jsx',
          'server/entry.jsx',
          'server-entry.jsx',
        ]],
        ['client.jsx'],
        ['routes.js'],
      ],
    }),
  ],
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
