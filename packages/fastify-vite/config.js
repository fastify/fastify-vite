const { fileURLToPath } = require('node:url')
const {
  dirname,
  join,
  resolve,
  resolveIfRelative,
  exists,
  stat,
  read,
} = require('./ioutils.cjs')
const { createHtmlTemplateFunction } = require('./html.js')

const DefaultConfig = {
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

  prepareServer(scope, config) {},

  async prepareClient(clientModule, scope, config) {
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
  const root = resolveRoot(options.root)
  const dev = typeof options.dev === 'boolean' ? options.dev : defaultConfig.dev
  const [vite, viteConfig] = await resolveViteConfig(root, dev, options)
  const resolveBundle = options.spa ? resolveSPABundle : resolveSSRBundle
  const bundle = await resolveBundle({ dev, vite })
  const config = Object.assign(defaultConfig, {
    ...options,
    vite,
    viteConfig,
    bundle,
  })
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
    'prepareClient',
  ]) {
    config[setting] = config.renderer[setting] || config[setting]
  }

  config.clientModule = config.clientModule || resolveClientModule(vite.root)

  return config
}

function resolveClientModule(root) {
  for (const ext of ['js', 'mjs', 'ts', 'cjs', 'jsx', 'tsx']) {
    const indexFile = join(root, `index.${ext}`)
    if (exists(indexFile)) {
      return `/index.${ext}`
    }
  }
  return null
}

function resolveRoot(path) {
  let root = path
  if (root.startsWith('file:')) {
    root = fileURLToPath(root)
  }
  if (stat(root).isFile()) {
    return dirname(root)
  }
  return root
}

async function resolveViteConfig(root, dev, { spa } = {}) {
  const command = 'serve'
  const mode = dev ? 'development' : 'production'

  if (!dev) {
    const { CACHE_DIR, CACHED_VITE_CONFIG_FILE_NAME } = await import('./sharedPaths.mjs')
    const viteConfigDistFile = resolve(CACHE_DIR, CACHED_VITE_CONFIG_FILE_NAME)

    if (exists(viteConfigDistFile)) {
      console.log(`Loading vite config at: ${viteConfigDistFile}`)

      return [JSON.parse(await read(viteConfigDistFile, 'utf-8')), CACHE_DIR]
    }
    console.warn(
      `${viteConfigDistFile} does not exist. Production builds will load the entire "vite" dependency.`,
      'If this is not intentional, make sure to use the viteFastify plugin in your vite config.',
    )
  }

  for (const ext of ['js', 'mjs', 'ts']) {
    let configFile = join(root, `vite.config.${ext}`)
    if (exists(configFile)) {
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
  }
  return [null, null]
}

async function resolveSSRBundle({ dev, vite }) {
  const bundle = {}
  let clientOutDir

  if (!dev) {
    if (vite.fastify) {
      clientOutDir = resolveIfRelative(vite.fastify.clientOutDir, vite.root)
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
    // SSR manifest location altered between Vite v4 and v5
    const v4SSRManifestPath = resolve(clientOutDir, 'ssr-manifest.json')
    // See https://github.com/vitejs/vite/pull/14230
    const ssrManifestPath = resolve(clientOutDir, '.vite/ssr-manifest.json')
    if (exists(v4SSRManifestPath)) {
      bundle.manifest = require(v4SSRManifestPath)
    } else if (exists(ssrManifestPath)) {
      bundle.manifest = require(ssrManifestPath)
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
      clientOutDir = resolveIfRelative(vite.fastify.clientOutDir, vite.root)
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
  resolveSSRBundle,
  resolveSPABundle,
}
module.exports.default = module.exports
