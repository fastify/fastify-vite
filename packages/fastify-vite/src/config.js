const { createClientEnvironment, createSSREnvironment } = require('./config/environments.ts')
const { DefaultConfig } = require('./config/defaults.ts')
const { resolveClientModule, resolveRoot } = require('./config/paths.ts')
const { resolveViteConfig } = require('./config/vite-config.ts')
const { resolveSSRBundle, resolveSPABundle } = require('./config/bundle.ts')

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

module.exports = {
  configure,
  createClientEnvironment,
  createSSREnvironment,
  resolveClientModule,
  resolveSSRBundle,
  resolveSPABundle,
}
module.exports.default = module.exports
