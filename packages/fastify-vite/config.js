const { fileURLToPath } = require('node:url')

const {
  dirname,
  join,
  resolve,
  parse,
  resolveIfRelative,
  isAbsolute,
  exists,
  stat,
  read,
  sep,
} = require('./ioutils.cjs')
const { createHtmlTemplateFunction } = require('./html.js')

function createClientEnvironment(dev, outDir) {
  return {
    build: {
      outDir: `${outDir}/client`,
      minify: !dev,
      sourcemap: dev,
      manifest: true,
    },
  }
}

function createSSREnvironment(dev, outDir, clientModule) {
  return {
    build: {
      outDir: `${outDir}/server`,
      ssr: true,
      minify: !dev,
      sourcemap: dev,
      emitAssets: true,
      rollupOptions: {
        input: {
          index: clientModule,
        },
      },
    },
  }
}

const DefaultConfig = {
  // Main distribution dir
  distDir: resolve(process.cwd(), 'dist'),

  // Whether or not to enable Vite's Dev Server
  dev: process.argv.includes('--dev'),

  // Vite's configuration file location
  root: null,

  // Vite's resolved config
  vite: null,

  // Vite's config path.
  // Automatically computed from root after resolveConfig()
  viteConfig: null,

  // Vite's distribution bundle info.
  // Automatically computed from Vite's default settings
  bundle: {
    manifest: null,
    indexHtml: null,
    dir: null, // deprecated
  },

  // Single object that can override all rendering settings that follow
  renderer: {},

  // Function to create SSR render function from server bundle
  createRenderFunction: null,

  // Module bridging client code to the server,
  // also referred to as the server entry point.
  // Automatically resolved from /index.(t|j)sx? if unset
  clientModule: null,

  // If true, disables SSR and disables loading of `clientModule`
  // This lets you automate integration with a SPA Vite bundle
  spa: false,

  // When loading environments' entry points,
  // @fastify/vite will recognize imports with this prefix
  // as virtual module imports and won't try to do
  // any path resolving on them
  virtualModulePrefix: '$app',

  prepareServer(scope, config) {},

  async prepareClient(entries, scope, config) {
    const clientModule = entries.ssr
    if (!clientModule) {
      return null
    }
    const routes =
      typeof clientModule.routes === 'function'
        ? await clientModule.routes()
        : clientModule.routes
    return Object.assign({}, clientModule, { routes })
  },

  // Compile index.html into templating function,
  // used by createHtmlFunction() by default
  createHtmlTemplateFunction,

  // Create reply.html() response function
  async createHtmlFunction(source, scope, config) {
    const indexHtmlTemplate = await config.createHtmlTemplateFunction(source)
    if (config.spa) {
      return function () {
        this.type('text/html')
        this.send(indexHtmlTemplate({ element: '' }))
        return this
      }
    }
    if (config.hasRenderFunction) {
      return async function (ctx) {
        this.type('text/html')
        this.send(await indexHtmlTemplate(ctx ?? (await this.render(ctx))))
        return this
      }
    }
    return async function (ctx) {
      this.type('text/html')
      this.send(await indexHtmlTemplate(ctx))
      return this
    }
  },

  // Function to register server routes for client routes
  async createRoute({ handler, errorHandler, route }, scope, config) {
    if (route.configure) {
      await route.configure(scope)
    }
    if (!route.path) {
      // throw new Error('Route missing `path` export.')
      return
    }
    scope.route({
      url: route.path,
      method: route.method ?? 'GET',
      handler,
      errorHandler,
      ...route,
    })
  },

  // Function to create the route handler passed to createRoute
  createRouteHandler({ client, route }, scope, config) {
    if (config.hasRenderFunction) {
      return async (req, reply) => {
        const page = await reply.render({
          app: scope,
          req,
          reply,
          client,
          route,
        })
        return reply.html(page)
      }
    }
    return async (req, reply) => {
      const page = await route.default({ app: scope, req, reply })
      return reply.html({
        app: scope,
        req,
        reply,
        client,
        route,
        element: page,
      })
    }
  },

  // Function to create the route errorHandler passed to createRoute
  createErrorHandler({ client, route }, scope, config) {
    return (error, req, reply) => {
      if (config.dev) {
        console.log(error)
        reply.code(500).type('application/json').send(JSON.stringify({ error }))
      } else {
        reply.code(500).send('')
      }
    }
  },
}

async function configure(options = {}) {
  const defaultConfig = { ...DefaultConfig }
  const root = resolveRoot(options.distDir ?? 'dist', options.root)
  const dev = typeof options.dev === 'boolean' ? options.dev : defaultConfig.dev
  const config = Object.assign(defaultConfig, { ...options })
  const [vite, viteConfig] = await resolveViteConfig(root, dev, config)
  Object.assign(config, { vite, viteConfig })

  const resolveBundle = options.spa ? resolveSPABundle : resolveSSRBundle
  const bundle = await resolveBundle({ dev, vite })
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
    vite.fastify.clientModule ??
    config.clientModule ??
    resolveClientModule(vite.root)

  return config
}

function resolveClientModule(root) {
  for (const ext of ['js', 'mjs', 'mts', 'ts', 'cjs', 'jsx', 'tsx']) {
    const indexFile = join(root, `index.${ext}`)
    if (exists(indexFile)) {
      return `/index.${ext}`
    }
  }
  return null
}

function resolveRoot(distDir, path) {
  let root = path
  if (root.startsWith('file:')) {
    root = fileURLToPath(root)
  }
  if (stat(root).isFile()) {
    root = dirname(root)
  }
  return root
}

async function resolveViteConfig(root, dev, { spa, distDir } = {}) {
  const command = 'build'
  const mode = dev ? 'development' : 'production'
  if (!dev) {
    let viteDistDir = distDir
    if (!isAbsolute(viteDistDir)) {
      viteDistDir = join(root, viteDistDir)
    }
    let viteConfigDistFile
    // Check for top-level dist/ folder
    viteConfigDistFile = resolve(viteDistDir, 'vite.config.json')
    if (exists(viteConfigDistFile)) {
      return [
        JSON.parse(await read(viteConfigDistFile, 'utf-8')),
        resolve(root, distDir),
      ]
    }
    // Check for client/dist/ folder (legacy default convention)
    viteConfigDistFile = join(root, 'client', 'dist', 'vite.config.json')
    if (exists(viteConfigDistFile)) {
      return [
        JSON.parse(await read(viteConfigDistFile, 'utf-8')),
        resolve(root, 'client', distDir),
      ]
    }
    console.warn(
      `Failed to load cached Vite configuration from ${viteConfigDistFile}`,
    )
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

async function resolveSSRBundle({ dev, vite }) {
  const bundle = {}
  let clientOutDir

  if (!dev) {
    if (vite.fastify) {
      clientOutDir = resolveIfRelative(vite.fastify.outDirs.client, vite.root)
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

async function resolveSPABundle({ dev, vite }) {
  const bundle = {}
  if (!dev) {
    let clientOutDir

    if (vite.fastify) {
      clientOutDir = resolveIfRelative(vite.fastify.outDirs.client, vite.root)
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

function findConfigFile(root) {
  for (const ext of ['js', 'mjs', 'ts']) {
    const configFile = join(root, `vite.config.${ext}`)
    if (exists(configFile)) {
      return configFile
    }
  }
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
