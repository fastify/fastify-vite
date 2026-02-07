import { DefaultConfig } from './config/defaults.ts'
import { resolveClientModule, resolveRoot } from './config/paths.ts'
import { resolveDevViteConfig, resolveProdViteConfig } from './config/vite-config.ts'
import type { FastifyViteOptions, RuntimeConfig, IncompleteRuntimeConfig } from './types/options.ts'

let hasWarnedDeprecatedViteAlias = false

export async function configure(options: FastifyViteOptions): Promise<RuntimeConfig> {
  const defaultConfig = { ...DefaultConfig }
  const { dev } = options
  const root = resolveRoot(options.root)
  const isDevMode = typeof dev === 'boolean' ? dev : defaultConfig.dev
  const runtimeConfig = Object.assign(defaultConfig, { ...options }) as IncompleteRuntimeConfig

  runtimeConfig.root = root

  const viteConfig = isDevMode
    ? await resolveDevViteConfig(root)
    : await resolveProdViteConfig(root, { distDir: runtimeConfig.distDir })

  runtimeConfig.viteConfig = viteConfig
  Object.defineProperty(runtimeConfig, 'vite', {
    configurable: true,
    enumerable: false,
    get() {
      if (!hasWarnedDeprecatedViteAlias) {
        hasWarnedDeprecatedViteAlias = true
        process.emitWarning(
          '`config.vite` is deprecated and will be removed in a future release. Use `config.viteConfig` instead.',
          'DeprecationWarning',
        )
      }
      return runtimeConfig.viteConfig
    },
  })

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

  // At this point, viteConfig is set, so it's a valid RuntimeConfig
  return runtimeConfig as RuntimeConfig
}
