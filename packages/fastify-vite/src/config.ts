import { DefaultConfig } from './config/defaults.ts'
import { resolveClientModule, resolveRoot } from './config/paths.ts'
import { resolveViteConfig } from './config/vite-config.ts'
import { resolveSSRBundle, resolveSPABundle } from './config/bundle.ts'
import type { ConfigOptions, RuntimeConfig } from './config/types.ts'

export async function configure(options: Partial<ConfigOptions> = {}): Promise<RuntimeConfig> {
  const defaultConfig = { ...DefaultConfig }
  const root = resolveRoot(options.root)
  const dev = typeof options.dev === 'boolean' ? options.dev : defaultConfig.dev
  const config = Object.assign(defaultConfig, { ...options }) as RuntimeConfig
  config.root = root
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
