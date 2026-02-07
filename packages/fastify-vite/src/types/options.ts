import type { FastifyInstance, RouteHandlerMethod, RouteOptions } from 'fastify'
import type { ResolvedConfig } from 'vite'

import type { ClientEntries, ClientModule } from './client.ts'
import type { HtmlTemplateFunction } from './html.ts'
import type { RendererOption } from './renderer.ts'
import type { ReplyDotHtmlFunction, ReplyDotRenderFunction } from './reply.ts'
import type { ClientRouteArgs, CreateRouteArgs } from './route.ts'
import type { SerializableViteConfig } from './vite-configs.ts'

/** User-provided options for the @fastify/vite plugin */
export interface FastifyViteOptions extends Partial<RendererOption> {
  /** Where to look for the vite configuration file */
  root: string

  /** Whether to use development mode or not */
  dev?: boolean

  /** Whether to use SPA mode or not */
  spa?: boolean
  renderer?: string | Partial<RendererOption>
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

/** Base runtime config with all resolved properties */
interface BaseRuntimeConfig {
  root: string
  spa: boolean
  distDir?: string
  prefix?: string
  baseAssetUrl?: string
  renderer: Record<string, unknown> | string
  virtualModulePrefix: string
  clientModule?: string
  hasRenderFunction?: boolean

  // Renderer functions
  prepareServer: (scope: FastifyInstance, config: RuntimeConfig) => void | Promise<void>

  prepareClient: (
    entries: ClientEntries,
    scope: FastifyInstance,
    config: RuntimeConfig,
  ) => Promise<ClientModule | undefined>

  createHtmlTemplateFunction: (
    source: string,
  ) => HtmlTemplateFunction | Promise<HtmlTemplateFunction>

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
  ) => RouteHandlerMethod | Promise<RouteHandlerMethod>

  createErrorHandler: (
    args: ClientRouteArgs,
    scope: FastifyInstance,
    config: RuntimeConfig,
  ) =>
    | NonNullable<RouteOptions['errorHandler']>
    | Promise<NonNullable<RouteOptions['errorHandler']>>

  createRenderFunction?: (
    clientModule: ClientModule,
    scope: FastifyInstance,
    config: RuntimeConfig,
  ) => ReplyDotRenderFunction | Promise<ReplyDotRenderFunction>
}

/**
 * Work-in-progress config used during configure().
 * All fields optional since they're filled incrementally.
 */
export interface IncompleteRuntimeConfig extends Partial<BaseRuntimeConfig> {
  dev?: boolean
  viteConfig?: ResolvedConfig | SerializableViteConfig
  /** @deprecated Use `viteConfig` instead. */
  readonly vite?: ResolvedConfig | SerializableViteConfig
}

/** Runtime config in development mode with full Vite resolved config */
export interface DevRuntimeConfig extends BaseRuntimeConfig {
  dev: true
  viteConfig: ResolvedConfig
  /** @deprecated Use `viteConfig` instead. */
  readonly vite: ResolvedConfig
}

/** Runtime config in production mode with serialized Vite config from vite.config.json */
export interface ProdRuntimeConfig extends BaseRuntimeConfig {
  dev: false
  viteConfig: SerializableViteConfig
  /** @deprecated Use `viteConfig` instead. */
  readonly vite: SerializableViteConfig
}

/** Resolved fastify-vite configuration built by merging options with default configs */
export type RuntimeConfig = DevRuntimeConfig | ProdRuntimeConfig
