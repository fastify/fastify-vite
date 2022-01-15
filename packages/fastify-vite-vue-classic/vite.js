const { createVuePlugin } = require('./plugin')
const viteBlueprint = require('vite-plugin-blueprint')

const dev = process.env.NODE_ENV !== 'production'

module.exports = {
  ssr: {
    external: ['fastify-vite-vue-classic', 'deepmerge'],
  },
  logLevel: dev ? 'error' : 'info',
  plugins: [
    createVuePlugin(),
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
        ['error.vue'],
        ['router.vue'],
        ['routes.js'],
        ['index.css'],
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
