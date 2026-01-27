import type { FastifyInstance } from 'fastify'
import type { Manifest, UserConfig } from 'vite'

import type { Bundle } from './bundle.ts'
import type { ClientEntries, ClientModule } from './client.ts'
import type { CreateRouteArgs, ErrorHandler, RouteHandler } from './handlers.ts'
import type { HtmlTemplateFunction } from './html.ts'
import type { RendererOption } from './renderer.ts'
import type { ReplyDotHtmlFunction, ReplyDotRenderFunction } from './reply.ts'
import type { ClientRouteArgs } from './route.ts'
import type { ExtendedResolvedViteConfig, SerializableViteConfig } from './vite-configs.ts'

/** User-provided options for the @fastify/vite plugin */
export interface FastifyViteOptions extends Partial<RendererOption> {
  dev?: boolean
  root: string
  spa?: boolean
  renderer?: string | Partial<RendererOption>
  vite?: UserConfig
  bundle?: {
    manifest?: Manifest
    indexHtml?: string | Buffer
    dir?: string
  }
  /**
   * Override the directory to search for `vite.config.json` in production mode.
   * By default, the runtime automatically finds the app root via `package.json`
   * and searches in both `dist/` and `build/` folders.
   * Only specify this if you use a different folder name (e.g., `out`).
   * If a relative path is provided, it is resolved relative to the app root.
   */
  distDir?: string
  /**
   * URL prefix for static asset routes in production mode.
   * Use this when mounting @fastify/vite under a path prefix.
   */
  prefix?: string
  /**
   * Custom base URL for assets in production HTML output.
   * Use this for CDN deployments where static assets are served from a different origin.
   * Example: `baseAssetUrl: process.env.CDN_URL`
   */
  baseAssetUrl?: string
}

/** Internal resolved configuration after defaults and renderer merged */
export interface ResolvedFastifyViteConfig {
  dev: boolean
  root: string
  spa: boolean

  // These stay optional (filled in by configure())
  distDir?: string
  prefix?: string

  // Override types that differ from FastifyViteOptions
  bundle: Bundle
  vite?: unknown
  renderer: Record<string, unknown> | string

  // Internal properties not in FastifyViteOptions
  virtualModulePrefix: string
  clientModule?: string

  // Renderer functions with resolved signatures (required, with defaults)
  prepareServer: (scope: FastifyInstance, config: RuntimeConfig) => void

  prepareClient: (
    entries: ClientEntries,
    scope: FastifyInstance,
    config: RuntimeConfig,
  ) => Promise<ClientModule | undefined>

  createHtmlTemplateFunction: (source: string) => Promise<HtmlTemplateFunction>

  createHtmlFunction: (
    source: string,
    scope: FastifyInstance,
    config: RuntimeConfig,
  ) => Promise<ReplyDotHtmlFunction>

  createRoute: (
    args: CreateRouteArgs,
    scope: FastifyInstance,
    config: RuntimeConfig,
  ) => void | Promise<void>

  createRouteHandler: (
    args: ClientRouteArgs,
    scope: FastifyInstance,
    config: RuntimeConfig,
  ) => RouteHandler

  createErrorHandler: (
    args: ClientRouteArgs,
    scope: FastifyInstance,
    config: RuntimeConfig,
  ) => ErrorHandler

  createRenderFunction?: (
    clientModule: ClientModule,
    scope: FastifyInstance,
    config: RuntimeConfig,
  ) => ReplyDotRenderFunction | Promise<ReplyDotRenderFunction>
}

interface BaseRuntimeConfig extends Omit<ResolvedFastifyViteConfig, 'dev' | 'vite'> {
  hasRenderFunction?: boolean
  ssrManifest?: Manifest
}

/** Runtime config in development mode with full Vite resolved config */
export interface DevRuntimeConfig extends BaseRuntimeConfig {
  dev: true
  vite: ExtendedResolvedViteConfig
}

/** Runtime config in production mode with serialized Vite config from vite.config.json */
export interface ProdRuntimeConfig extends BaseRuntimeConfig {
  dev: false
  vite: ExtendedResolvedViteConfig | SerializableViteConfig
}

export type RuntimeConfig = DevRuntimeConfig | ProdRuntimeConfig
