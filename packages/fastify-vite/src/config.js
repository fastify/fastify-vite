const {
  dirname,
  join,
  resolve,
  resolveIfRelative,
  isAbsolute,
  exists,
  read,
} = require('./ioutils.cts')
const { createClientEnvironment, createSSREnvironment } = require('./config/environments.ts')
const { DefaultConfig } = require('./config/defaults.ts')
const {
  findConfigFile,
  findViteConfigJson,
  getApplicationRootDir,
  resolveClientModule,
  resolveRoot,
} = require('./config/paths.ts')

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

async function resolveViteConfig(root, dev, { spa, distDir } = {}) {
  const command = 'build'
  const mode = dev ? 'development' : 'production'
  if (!dev) {
    const appRoot = await getApplicationRootDir(root)
    let viteConfigDistFile
    if (distDir) {
      if (isAbsolute(distDir)) {
        viteConfigDistFile = join(dirname(distDir), 'vite.config.json')
      } else {
        viteConfigDistFile = findViteConfigJson(appRoot, [distDir])
      }
    } else {
      // Auto-detect from standard locations relative to app root
      viteConfigDistFile = findViteConfigJson(appRoot)
    }
    if (viteConfigDistFile) {
      return [JSON.parse(await read(viteConfigDistFile, 'utf-8')), dirname(viteConfigDistFile)]
    }
    const searchedIn = distDir || `${appRoot}/{dist,build}`
    console.warn(`Failed to load cached Vite configuration. Searched in: ${searchedIn}`)
    process.exit(1)
  }

  let configFile = findConfigFile(root)
  if (!configFile) {
    return [null, null]
  }
  const { resolveConfig } = await import('vite')
  const resolvedConfig = await resolveConfig(
    {
      configFile,
    },
    command,
    mode,
  )
  if (process.platform === 'win32') {
    configFile = `file://${configFile}`
  }
  let userConfig = await import(configFile).then((m) => m.default)
  if (userConfig.default) {
    userConfig = userConfig.default
  }
  if (typeof userConfig === 'function') {
    userConfig = await userConfig({
      command,
      mode,
      ssrBuild: !spa,
    })
  }
  userConfig.fastify = resolvedConfig.fastify

  return [
    Object.assign(userConfig, {
      build: {
        assetsDir: resolvedConfig.build.assetsDir,
        outDir: resolvedConfig.build.outDir,
      },
    }),
    configFile,
  ]
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
