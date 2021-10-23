const { resolve } = require('path')
const { readFile, pathExists, readdir } = require('fs-extra')

const shadowModules = [
  'entry/client',
  'entry/server',
  'routes',
]

const overrideMap = {
  'entry/client': [
    'entry/client.js',
    'entry-client.js',
    'client/entry.js',
    'client-entry.js',
  ],
  'entry/server': [
    'entry/server.js',
    'entry-server.js',
    'server/entry.js',
    'server-entry.js',
  ],
  'routes': [
    'routes.js',
  ],
}

function fastifyViteVuePlugin () {
  let root
  return {
    name: 'fastify-vite-vue',
    config (config) {
      root = config.root
    },
    async resolveId (id)  {
      const [, shadowModule] = id.split('@fastify-vite-vue/')
      if (shadowModule && shadowModules.includes(shadowModule)) {
        const overrides = overrideMap[shadowModule]
        for (const override of overrides) {
          if (await pathExists(resolve(root, override))) {
            return
          }
        }
        return id
      }
    },
    async load (id) {
      const [, shadowModule] = id.split('@fastify-vite-vue/')
      if (shadowModule) {
        return {
          code: await readFile(resolve(__dirname, 'shadow', `${shadowModule}.js`), 'utf8'),
          map: null
        }
      }
    }
  }
}

module.exports = fastifyViteVuePlugin
