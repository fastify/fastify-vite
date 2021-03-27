const { assign } = Object
const { existsSync, readFileSync } = require('fs')
const { resolve } = require('path')
const { resolveConfig } = require('vite')
const vuePlugin = require('@vitejs/plugin-vue')
const vueJsx = require('@vitejs/plugin-vue-jsx')

const defaults = {
  dev: process.env.NODE_ENV !== 'production',
  hydration: {
    global: '$global',
    data: '$data',
    api: '$api'
  },
  root: process.cwd(),
  entry: {
    client: '/entry/client.js',
    server: '/entry/server.js'
  },
  vite: {
    logLevel: 'error',
    plugins: [
      vuePlugin(),
      vueJsx()
    ],
    build: {
      assetsDir: 'assets',
      outDir: 'dist',
      minify: false
    }
  }
}

function getOptions (options) {
  options = assign({}, defaults, options)
  if (typeof options.root === 'function') {
    options.root = options.root(resolve)
  }
  return options
}

async function patchOptions (options) {
  const viteOptions = await getViteOptions(options)

  options.vite.build.assetsDir = viteOptions.build.assetsDir

  if (!options.dev) {
    options.distDir = resolve(options.root, viteOptions.build.outDir)
    const distIndex = resolve(options.distDir, 'client/index.html')
    if (!existsSync(distIndex)) {
      throw new Error('Missing production client/index.html — did you build first?')
    }
    options.distIndex = readFileSync(distIndex, 'utf8')
    options.distManifest = require(resolve(options.distDir, 'client/ssr-manifest.json'))
  } else {
    options.distManifest = []
  }
  return options
}

module.exports = { defaults, getOptions, patchOptions }

function getViteOptions (options) {
  const mergedOptions = { root: options.root, ...defaults.vite, ...options.vite }
  // If vite.config.js is present, resolveConfig() ensures it's taken into consideration
  // Note however that vite options set via fastify-vite take precedence over vite.config.js
  return resolveConfig(mergedOptions, 'build')
}
