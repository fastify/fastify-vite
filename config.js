const { resolveConfig } = require('vite')
const { join, resolve, exists, read } = require('./ioutils')
const { compile } = require('tempura')

class Config {
  // Whether or not to enable Vite's Dev Server
  dev = false
  // Vite's configuration file location
  configRoot = null
  // Vite's resolved config
  vite = null
  // Vite's config path
  viteConfig = null
  // Vite's distribution bundle info
  bundle = {
    manifest: null,
    indexHtml: null,
    dir: null,
  }

  // The renderer adapter to use
  renderer = null
  // Can override all rendering settings bellow
  //
  // Function to create SSR render function from server bundle
  createRenderFunction = null
  // Vite entry points for server and client bundles
  serverEntryPoint = '/entry/server.js'
  clientEntryPoint = '/entry/client.js'
  // Compile index.html into a templating function
  compileIndexHtml (source) {
    // Use tempura by default
    // https://github.com/lukeed/tempura
    const template = compile(source)
    return ctx => template(ctx)
  }

  // Function to create the instance.vite.route() method
  createRouteFunction (scope, handler) {
    return (url, routeOptions = {}) => {
      scope.route({ url, handler, method: 'GET', ...routeOptions })
    }
  }
}

async function configure (options = {}) {
  const [vite, viteConfig] = await resolveViteConfig(options.configRoot)
  const bundle = await resolveBundle({ ...options, vite })
  return Object.assign(new Config(), { ...options, vite, viteConfig, bundle })
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
