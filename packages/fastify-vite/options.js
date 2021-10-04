const { assign } = Object
const { existsSync, readFileSync } = require('fs')
const { resolve } = require('path')
const { resolveConfig } = require('vite')

// Used to determine whether to use Vite's dev server or not
const dev = process.env.NODE_ENV !== 'production'

const defaults = {
  dev,
  // If true, causes the Fastify server boot to halt after onReady
  build: process.argv.includes('build'),
  // Used to determine the keys to be injected in the application's boot
  // For Vue 3, that means adding them to globalProperties
  hydration: {
    global: '$global',
    payload: '$payload',
    data: '$data',
  },
  // Static generation options
  generate: {
    enabled: process.argv.includes('generate'),
    server: {
      port: 5000,
      enabled: process.argv.includes('generate-server'),
    },
  },
  // Vite root app directory, whatever you set here
  // is also set under `vite.root` so Vite picks it up
  root: process.cwd(),
  // Any Vite configuration option set here
  // takes precedence over <root>/vite.config.js
  renderer: null,
  vite: null,
}

async function processOptions (options) {
  if (options.generate) {
    if (options.generate.server) {
      options.generate.server = assign({}, defaults.generate.server, options.generate.server)
    }
    options.generate = assign({}, defaults.generate, options.generate)
  }
  options = assign({}, defaults, options)

  if (typeof options.root === 'function') {
    options.root = options.root(resolve)
  }

  const viteOptions = await getViteOptions(options)

  if (!options.renderer) {
    throw new Error('Must set options.renderer')
  }

  options.vite = assign({}, options.renderer.options.vite, options.vite)
  options = assign({}, options.renderer.options, options)

  function recalcDist () {
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
  }

  recalcDist()
  options.recalcDist = recalcDist

  return options
}

module.exports = { processOptions }

function getViteOptions (options) {
  const mergedOptions = { root: options.root, ...defaults.vite, ...options.vite }
  // If vite.config.js is present, resolveConfig() ensures it's taken into consideration
  // Note however that vite options set via fastify-vite take precedence over vite.config.js
  return resolveConfig(mergedOptions, 'build')
}
