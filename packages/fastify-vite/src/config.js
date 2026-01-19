const {
  resolve,
  resolveIfRelative,
  exists,
  read,
} = require('./ioutils.cts')
const { createClientEnvironment, createSSREnvironment } = require('./config/environments.ts')
const { DefaultConfig } = require('./config/defaults.ts')
const { resolveClientModule, resolveRoot } = require('./config/paths.ts')
const { resolveViteConfig } = require('./config/vite-config.ts')

async function configure(options = {}) {
  const defaultConfig = { ...DefaultConfig }
  const root = resolveRoot(options.root)
  const dev = typeof options.dev === 'boolean' ? options.dev : defaultConfig.dev
  const config = Object.assign(defaultConfig, { ...options })
  config.root = root // Store resolved root for use in production.js
  const [vite, viteConfig] = await resolveViteConfig(root, dev, config)
  Object.assign(config, { vite, viteConfig })

  const resolveBundle = options.spa ? resolveSPABundle : resolveSSRBundle
  const bundle = await resolveBundle({ dev, vite, root })
  Object.assign(config, { bundle })
  if (typeof config.renderer === 'string') {
    const { default: renderer, ...named } = await import(config.renderer)
    config.renderer = { ...renderer, ...named }
  }
  for (const setting of [
    'clientModule',
    'createErrorHandler',
    'createHtmlFunction',
    'createHtmlTemplateFunction',
    'createRenderFunction',
    'createRoute',
    'createRouteHandler',
    'prepareServer',
    'prepareEnvironments',
    'prepareClient',
  ]) {
    config[setting] = config.renderer[setting] || config[setting]
  }

  config.clientModule =
    vite.fastify.clientModule ?? config.clientModule ?? resolveClientModule(vite.root)

  return config
}


async function resolveSSRBundle({ dev, vite, root }) {
  const bundle = {}
  let clientOutDir

  if (!dev) {
    if (vite.fastify) {
      clientOutDir = resolveIfRelative(
        vite.fastify.outDirs.client,
        await getApplicationRootDir(root),
      )
    } else {
      // Backwards compatibility for projects that do not use the viteFastify plugin.
      bundle.dir = resolveIfRelative(vite.build.outDir, vite.root)
      clientOutDir = resolve(bundle.dir, 'client')
    }

    const indexHtmlPath = resolve(clientOutDir, 'index.html')
    if (!exists(indexHtmlPath)) {
      return
    }
    bundle.indexHtml = await read(indexHtmlPath, 'utf8')
    const manifestPaths = [
      // Vite v4 and v5
      resolve(clientOutDir, 'ssr-manifest.json'),
      // Vite v6 Beta
      resolve(clientOutDir, '.vite/ssr-manifest.json'),
      // Vite v6
      resolve(clientOutDir, '.vite/manifest.json'),
    ]
    for (const manifestPath of manifestPaths) {
      if (exists(manifestPath)) {
        bundle.manifest = require(manifestPath)
      }
    }
  } else {
    bundle.manifest = []
  }
  return bundle
}

async function resolveSPABundle({ dev, vite, root }) {
  const bundle = {}
  if (!dev) {
    let clientOutDir

    if (vite.fastify) {
      clientOutDir = resolveIfRelative(
        vite.fastify.outDirs.client,
        await getApplicationRootDir(root),
      )
    } else {
      // Backwards compatibility for projects that do not use the viteFastify plugin.
      bundle.dir = resolveIfRelative(vite.build.outDir, vite.root)
      clientOutDir = resolve(bundle.dir, 'client')
    }

    const indexHtmlPath = resolve(clientOutDir, 'index.html')
    if (!exists(indexHtmlPath)) {
      return
    }
    bundle.indexHtml = await read(indexHtmlPath, 'utf8')
  } else {
    bundle.manifest = []
  }
  return bundle
}

module.exports = {
  configure,
  createClientEnvironment,
  createSSREnvironment,
  resolveClientModule,
  resolveSSRBundle,
  resolveSPABundle,
}
module.exports.default = module.exports
