import { DefaultConfig } from './config/defaults.ts'
import { resolveClientModule, resolveRoot } from './config/paths.ts'
import { resolveDevViteConfig, resolveProdViteConfig } from './config/vite-config.ts'
import { resolveSSRBundle, resolveSPABundle } from './config/bundle.ts'
import type { FastifyViteOptions, PartialRuntimeConfig, RuntimeConfig } from './types/options.ts'

export async function configure(options: FastifyViteOptions): Promise<RuntimeConfig> {
  const defaultConfig = { ...DefaultConfig }
  const { baseAssetUrl, dev, spa } = options
  const root = resolveRoot(options.root)
  const isDevMode = typeof dev === 'boolean' ? dev : defaultConfig.dev
  const runtimeConfig = Object.assign(defaultConfig, { ...options }) as PartialRuntimeConfig

  runtimeConfig.root = root

  const viteConfig = isDevMode
    ? await resolveDevViteConfig(root)
    : await resolveProdViteConfig(root, { distDir: runtimeConfig.distDir })

  runtimeConfig.viteConfig = viteConfig

  const resolveBundle = spa ? resolveSPABundle : resolveSSRBundle
  runtimeConfig.bundle = await resolveBundle({ baseAssetUrl, isDevMode, root, viteConfig })

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

  // At this point, viteConfig and bundle are set, so it's a valid RuntimeConfig
  return runtimeConfig as RuntimeConfig
}
