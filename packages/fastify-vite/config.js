const { resolveConfig } = require('vite')
const { join, resolve, exists, read } = require('./ioutils')
const { createHtmlTemplateFunction: _createHtmlTemplateFunction } = require('./html')

class Config {
  // Whether or not to enable Vite's Dev Server
  dev = false

  // Vite's configuration file location
  configRoot = null

  // Vite's resolved config
  vite = null

  // Vite's config path
  viteConfig = null

  // Vite's distribution bundle info,
  // automatically computed from Vite's default settings
  bundle = {
    manifest: null,
    indexHtml: null,
    dir: null,
  }

  // Single object that can override all rendering settings that follow
  renderer = {}

  // Function to create SSR render function from server bundle
  createRenderFunction = null

  // Module bridging client code to the server,
  // also referred to as the server entry point
  clientModule = null

  async prepareClient ({ routes, render }, scope, config) {
    if (typeof routes === 'function') {
      routes = await routes()
    }
    return { routes, render }
  }

  // Compile index.html into templating function, 
  // used by createHtmlFunction() by default
  createHtmlTemplateFunction = _createHtmlTemplateFunction

  // Create reply.html() response function
  createHtmlFunction (source, scope, config) {
    const indexHtmlTemplate = createHtmlTemplateFunction(source)
    return function (ctx) {
      this.send(indexHtmlTemplate(ctx))
    }
  }

  // Function to register server routes for client routes
  createRoute ({ handler, errorHandler, route }, scope, config) {
    scope.route({
      url: route.path,
      method: 'GET',
      handler,
      errorHandler,
      ...route,
    })
  }

  // Function to create the route handler passed to createRoute
  createRouteHandler (scope, options) {
    return async function (req, reply) {
      const fragments = await reply.render()
      reply.html(fragments)
    }
  }

  // Function to create the route errorHandler passed to createRoute
  createErrorHandler (scope) {
    return (error, req, reply) => {
      scope.vite.devServer.ssrFixStacktrace(error)
      scope.errorHandler(error, req, reply)
    }
  }
}

async function configure (options = {}) {
  const [vite, viteConfig] = await resolveViteConfig(options.configRoot)
  const clientModule = resolveClientModule(vite.root)
  const bundle = await resolveBundle({ ...options, vite })
  const config = Object.assign(new Config(), {
    ...options,
    vite,
    viteConfig,
    bundle,
    clientModule,
  })
  for (const setting of [
    'compileIndexHtml',
    'createHandler',
    'createRenderFunction',
    'clientEntryPoint',
    'serverEntryPoint',
  ]) {
    config[setting] = config.renderer[setting] ?? config[setting]
  }
  return config
}

function resolveClientModule (root) {
  for (const ext of ['js', 'mjs', 'ts', 'cjs']) {
    const indexFile = join(root, `index.${ext}`)
    console.log('indexFile', indexFile)
    if (exists(indexFile)) {
      return `/index.${ext}`
    }
  }
  return null
}

async function resolveViteConfig (configRoot) {
  for (const ext of ['js', 'mjs', 'ts', 'cjs']) {
    const configFile = join(configRoot, `vite.config.${ext}`)
    if (exists(configFile)) {
      return [
        await resolveConfig({ configFile }, 'build', 'production'),
        configFile,
      ]
    }
  }
  return [null, null]
}

async function resolveBundle ({ dev, vite }) {
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

async function resolveBuildCommands (configRoot, renderer) {
  const [vite] = await resolveViteConfig(configRoot)
  return [
    ['build', '--outDir', `${vite.build.outDir}/client`, '--ssrManifest'],
    ['build', '--ssr', renderer.serverEntryPoint, '--outDir', `${vite.build.outDir}/server`],
  ]
}

function viteESModuleSSR () {
  return {
    name: 'vite-es-module-ssr',
    config (config, { command }) {
      if (command === 'build' && config.build?.ssr) {
        config.build.rollupOptions = {
          output: {
            format: 'es',
          },
        }
      }
    },
  }
}

module.exports = {
  configure,
  resolveBundle,
  resolveBuildCommands,
  viteESModuleSSR,
}
module.exports.default = module.exports
