import { DefaultConfig } from './config/defaults.ts'
import { resolveClientModule, resolveRoot } from './config/paths.ts'
import { resolveDevViteConfig, resolveProdViteConfig } from './config/vite-config.ts'
import { resolveSSRBundle, resolveSPABundle } from './config/bundle.ts'
import type { FastifyViteOptions, RuntimeConfig } from './types/options.ts'

export async function configure(options: FastifyViteOptions): Promise<RuntimeConfig> {
  const defaultConfig = { ...DefaultConfig }
  const root = resolveRoot(options.root)
  const dev = typeof options.dev === 'boolean' ? options.dev : defaultConfig.dev
  const config = Object.assign(defaultConfig, { ...options }) as RuntimeConfig
  config.root = root
  const vite = dev
    ? await resolveDevViteConfig(root, { spa: config.spa })
    : await resolveProdViteConfig(root, { distDir: config.distDir })
  Object.assign(config, { vite })

  const baseAssetUrl = options.baseAssetUrl
  const originalBase = vite.base || '/'

  const resolveBundle = options.spa ? resolveSPABundle : resolveSSRBundle
  const bundle = await resolveBundle({ dev, vite, root, baseAssetUrl, originalBase })
  Object.assign(config, { bundle })
  if (typeof config.renderer === 'string') {
    const { default: renderer, ...named } = await import(config.renderer)
    config.renderer = { ...renderer, ...named }
  }
  // Settings that can be provided by a renderer package to override defaults
  const rendererSettings = [
    'clientModule',
    'createErrorHandler',
    'createHtmlFunction',
    'createHtmlTemplateFunction',
    'createRenderFunction',
    'createRoute',
    'createRouteHandler',
    'prepareServer',
    'prepareClient',
  ] as const
  type RendererSettingKey = (typeof rendererSettings)[number]

  for (const setting of rendererSettings) {
    const rendererConfig = config.renderer as Record<string, unknown>
    const configRecord = config as unknown as Record<RendererSettingKey, unknown>
    configRecord[setting] = rendererConfig[setting] ?? configRecord[setting]
  }

  config.clientModule =
    vite.fastify.clientModule ?? config.clientModule ?? resolveClientModule(vite.root)

  return config
}
