const viteVue = require('@vitejs/plugin-vue')
const viteVueJsx = require('@vitejs/plugin-vue-jsx')
const viteBlueprint = require('vite-plugin-blueprint')

const dev = process.env.NODE_ENV !== 'production'

module.exports = {
  logLevel: dev ? 'error' : 'info',
  plugins: [
    viteVue(),
    viteVueJsx(),
    viteBlueprint({
      prefix: '@app/',
      root: resolve => resolve(__dirname, 'base'),
      files: [
        ['entry/client.js', [
          'entry-client.js',
          'client/entry.js',
          'client-entry.js',
        ]],
        ['entry/server.js', [
          'entry-server.js',
          'server/entry.js',
          'server-entry.js',
        ]],
        ['client.js'],
        ['client.vue'],
        ['head.js'],
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
}
