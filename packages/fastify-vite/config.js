const { fileURLToPath } = require('node:url')
const { resolveConfig } = require('vite')
const { dirname, join, resolve, exists, stat, read } = require('./ioutils')
const { createHtmlTemplateFunction } = require('./html')

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
    dir: null
  },

  // Single object that can override all rendering settings that follow
  renderer: {},

  // Function to create SSR render function from server bundle
  createRenderFunction: null,

  // Module bridging client code to the server,
  // also referred to as the server entry point.
  // Automatically resolved from /index.js if unset
  clientModule: null,

  // If true, disables SSR and disables loading of `clientModule`
  // This lets you automate integration with a SPA Vite bundle
  spa: false,

  async prepareClient (clientModule, scope, config) {
    if (!clientModule) {
      return null
    }
    const routes = typeof clientModule.routes === 'function'
      ? await clientModule.routes()
      : clientModule.routes
    return Object.assign({}, clientModule, { routes })
  },

  // Compile index.html into templating function,
  // used by createHtmlFunction() by default
  createHtmlTemplateFunction,

  // Create reply.html() response function
  createHtmlFunction (source, scope, config) {
    const indexHtmlTemplate = config.createHtmlTemplateFunction(source)
    if (config.spa) {
      return function () {
        this.type('text/html')
        this.send(indexHtmlTemplate({ element: '' }))
      }
    }
    return function (ctx) {
      this.type('text/html')
      this.send(indexHtmlTemplate(ctx ?? this.render()))
    }
  },

  // Function to register server routes for client routes
  createRoute ({ handler, errorHandler, route }, scope, config) {
    scope.route({
      url: route.path,
      method: 'GET',
      handler,
      errorHandler,
      ...route
    })
  },

  // Function to create the route handler passed to createRoute
  createRouteHandler (client, scope, config) {
    return async function (req, reply) {
      const page = await reply.render(scope, req, reply)
      reply.html(page)
      return reply
    }
  },

  // Function to create the route errorHandler passed to createRoute
  createErrorHandler (client, scope, config) {
    return (error, req, reply) => {
      if (config.dev) {
        console.error(error)
        scope.vite.devServer.ssrFixStacktrace(error)
      }
      scope.errorHandler(error, req, reply)
    }
  }
}

async function configure (options = {}) {
  const defaultConfig = { ...DefaultConfig }
  const root = resolveRoot(options.root)
  const dev = typeof options.dev === 'boolean' ? options.dev : defaultConfig.dev
  const [vite, viteConfig] = await resolveViteConfig(root, dev, options.spa)
  const resolveBundle = options.spa ? resolveSPABundle : resolveSSRBundle
  const bundle = await resolveBundle({ dev, vite })
  const config = Object.assign(defaultConfig, {
    ...options,
    vite,
    viteConfig,
    bundle
  })
  for (const setting of [
    'clientModule',
    'createErrorHandler',
    'createHtmlFunction',
    'createHtmlTemplateFunction',
    'createRenderFunction',
    'createRoute',
    'createRouteHandler',
    'prepareClient'
  ]) {
    config[setting] = config.renderer[setting] || config[setting]
  }
  if (config.spa) {
    config.createRenderFunction = () => {}
  } else {
    config.clientModule = config.clientModule || resolveClientModule(vite.root)
  }
  return config
}

function resolveClientModule (root) {
  for (const ext of ['js', 'mjs', 'ts', 'cjs', 'jsx', 'tsx']) {
    const indexFile = join(root, `index.${ext}`)
    if (exists(indexFile)) {
      return `/index.${ext}`
    }
  }
  return null
}

function resolveRoot (root) {
  if (root.startsWith('file:')) {
    root = fileURLToPath(root)
  }
  if (stat(root).isFile()) {
    return dirname(root)
  } else {
    return root
  }
}

async function resolveViteConfig (root, dev, isSpa) {
  const command = 'serve'
  const mode = dev ? 'development' : 'production'
  for (const ext of ['js', 'mjs', 'ts']) {
    let configFile = join(root, `vite.config.${ext}`)
    if (exists(configFile)) {
      const resolvedConfig = await resolveConfig({
        configFile
      }, command, mode)
      if (process.platform === 'win32') {
        configFile = `file://${configFile}`
      }
      let userConfig = await import(configFile).then(m => m.default)
      if (userConfig.default) {
        userConfig = userConfig.default
      }
      if (typeof userConfig === 'function') {
        userConfig = await userConfig({
          command,
          mode,
          ssrBuild: !isSpa
        })
      }
      return [
        Object.assign(userConfig, {
          build: {
            assetsDir: resolvedConfig.build.assetsDir,
            outDir: resolvedConfig.build.outDir
          }
        }),
        configFile
      ]
    }
  }
  return [null, null]
}

async function resolveSSRBundle ({ dev, vite }) {
  const bundle = {}
  if (!dev) {
    bundle.dir = resolve(vite.root, vite.build.outDir)
    const indexHtmlPath = resolve(bundle.dir, 'client/index.html')
    if (!exists(indexHtmlPath)) {
      return
    }
    bundle.indexHtml = await read(indexHtmlPath, 'utf8')
    bundle.manifest = require(resolve(bundle.dir, 'client/ssr-manifest.json'))
  } else {
    bundle.manifest = []
  }
  return bundle
}

async function resolveSPABundle ({ dev, vite }) {
  const bundle = {}
  if (!dev) {
    bundle.dir = resolve(vite.root, vite.build.outDir)
    const indexHtmlPath = resolve(bundle.dir, 'index.html')
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
  resolveSPABundle
}
module.exports.default = module.exports
