import { DefaultConfig } from './config/defaults.ts'
import { resolveClientModule, resolveRoot } from './config/paths.ts'
import { resolveDevViteConfig, resolveProdViteConfig } from './config/vite-config.ts'
import { resolveSSRBundle, resolveSPABundle } from './config/bundle.ts'
import type { FastifyViteOptions, RuntimeConfig } from './types/options.ts'

export async function configure(options: FastifyViteOptions): Promise<RuntimeConfig> {
  const defaultConfig = { ...DefaultConfig }
  const root = resolveRoot(options.root)
  const dev = typeof options.dev === 'boolean' ? options.dev : defaultConfig.dev
  const runtimeConfig = Object.assign(defaultConfig, { ...options }) as RuntimeConfig

  runtimeConfig.root = root

  const viteConfig = dev
    ? await resolveDevViteConfig(root, { spa: runtimeConfig.spa })
    : await resolveProdViteConfig(root, { distDir: runtimeConfig.distDir })

  Object.assign(runtimeConfig, { viteConfig })

  const baseAssetUrl = options.baseAssetUrl
  const originalBase = viteConfig.base || '/'

  const resolveBundle = options.spa ? resolveSPABundle : resolveSSRBundle
  const bundle = await resolveBundle({ dev, vite: viteConfig, root, baseAssetUrl, originalBase })
  Object.assign(runtimeConfig, { bundle })
  if (typeof runtimeConfig.renderer === 'string') {
    const { default: renderer, ...named } = await import(runtimeConfig.renderer)
    runtimeConfig.renderer = { ...renderer, ...named }
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
    const rendererConfig = runtimeConfig.renderer as Record<string, unknown>
    const configRecord = runtimeConfig as unknown as Record<RendererSettingKey, unknown>
    configRecord[setting] = rendererConfig[setting] ?? configRecord[setting]
  }

  runtimeConfig.clientModule =
    viteConfig.fastify.clientModule ??
    runtimeConfig.clientModule ??
    resolveClientModule(viteConfig.root)

  return runtimeConfig
}
