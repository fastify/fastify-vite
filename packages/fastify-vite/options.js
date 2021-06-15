const { assign } = Object
const { existsSync, readFileSync } = require('fs')
const { resolve } = require('path')
const { resolveConfig } = require('vite')

// Used to determine whether to use Vite's dev server or not
const dev = process.env.NODE_ENV !== 'production'

const defaults = {
  dev,
  // Used to determine the keys to be injected in the application's boot
  // For Vue 3, that means adding them to globalProperties
  hydration: {
    global: '$global',
    data: '$data',
  },
  // Vite root app directory, whatever you set here
  // is also set under `vite.root` so Vite picks it up
  root: process.cwd(),
  // App's entry points for generating client and server builds
  entry: {
    // This differs from Vite's choice for its playground examples,
    // which is having entry-client.js and entry-server.js files on
    // the same top-level folder. For better organization fastify-vite
    // expects them to be grouped under /entry
    client: '/entry/client.js',
    server: '/entry/server.js',
  },
  // Any Vite configuration option set here
  // takes precedence over <root>/vite.config.js
  renderer: null,
  vite: null,
}

async function processOptions (options) {
  options = assign({}, defaults, options)

  if (typeof options.root === 'function') {
    options.root = options.root(resolve)
  }

  const viteOptions = await getViteOptions(options)

  if (!options.renderer) {
    throw new Error('Must set options.renderer')
  }

  options.vite = options.renderer.options

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

module.exports = { processOptions }

function getViteOptions (options) {
  const mergedOptions = { root: options.root, ...defaults.vite, ...options.vite }
  // If vite.config.js is present, resolveConfig() ensures it's taken into consideration
  // Note however that vite options set via fastify-vite take precedence over vite.config.js
  return resolveConfig(mergedOptions, 'build')
}
