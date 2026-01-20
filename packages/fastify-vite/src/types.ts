import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { ResolvedConfig, UserConfig } from 'vite'

export type ViteFastifyConfig = {
  clientModule?: string
  entryPaths?: Record<string, string>
  outDirs?: Record<string, string>
}

/** The fastify extension added to Vite configs */
export interface WithFastifyConfig {
  fastify?: ViteFastifyConfig
}

/** Vite ResolvedConfig extended with fastify properties */
export interface ExtendedResolvedViteConfig extends ResolvedConfig, WithFastifyConfig {}

/** Vite UserConfig extended with fastify properties */
export interface ExtendedUserConfig extends UserConfig, WithFastifyConfig {}

/** The JSON structure written to vite.config.json by the plugin */
export interface SerializableViteConfig extends WithFastifyConfig {
  base?: string
  root?: string
  build?: {
    assetsDir?: string
    outDir?: string
  }
}

export interface BundleInfo {
  manifest?: unknown
  indexHtml?: string
  dir?: string
}

export interface Bundle {
  manifest?: unknown
  indexHtml?: string
  dir?: string
}

export type BundleConfig = {
  dev: boolean
  vite: ExtendedResolvedViteConfig
  root: string
}

export interface ClientModule {
  createApp?: (...args: unknown[]) => unknown
  create?: (...args: unknown[]) => unknown
  routes?: unknown
  [key: string]: unknown
}

export interface ClientEntries {
  ssr?: ClientModule
  [key: string]: unknown
}

export interface RenderContext {
  app?: FastifyInstance
  server?: FastifyInstance
  req?: FastifyRequest
  reply?: FastifyReply
  client?: unknown
  route?: RouteDefinition
  [key: string]: unknown
}

export interface RouteDefinition {
  path?: string
  method?: string
  configure?: (scope: FastifyInstance) => void | Promise<void>
  default?: (...args: unknown[]) => unknown
  [key: string]: unknown
}

export type RenderResult = Record<string, unknown>

export type RenderFunction = (
  this: FastifyReply,
  ctx?: RenderContext,
) => RenderResult | Promise<RenderResult>

/**
 * A FastifyReply that has been decorated with html() and render() methods.
 * This is the reply type available after vite.ready() has been called.
 */
export type DecoratedReply = FastifyReply & {
  render: (ctx?: RenderContext) => RenderResult | Promise<RenderResult>
  html: (ctx?: RenderResult) => FastifyReply | Promise<FastifyReply>
}

export type HtmlTemplateFunction = (data?: RenderResult) => string

export type CreateHtmlTemplateFunction = (source: string) => Promise<HtmlTemplateFunction>

export type HtmlFunction = (
  this: FastifyReply,
  ctx?: RenderResult,
) => FastifyReply | Promise<FastifyReply>

export type CreateHtmlFunction = (
  source: string,
  scope: FastifyInstance,
  config: RuntimeConfig,
) => Promise<HtmlFunction>

export type RouteHandler = (
  req: FastifyRequest,
  reply: DecoratedReply,
) => DecoratedReply | Promise<DecoratedReply>

export type CreateRouteHandler = (
  args: { client?: unknown; route?: RouteDefinition },
  scope: FastifyInstance,
  config: RuntimeConfig,
) => RouteHandler

export type ErrorHandler = (error: Error, req: FastifyRequest, reply: FastifyReply) => void

export type CreateErrorHandler = (
  args: { client?: unknown; route?: RouteDefinition },
  scope: FastifyInstance,
  config: RuntimeConfig,
) => ErrorHandler

export type CreateRouteArgs = {
  client?: unknown
  handler?: RouteHandler
  errorHandler: ErrorHandler
  route?: RouteDefinition
}

export type CreateRoute = (
  args: CreateRouteArgs,
  scope: FastifyInstance,
  config: RuntimeConfig,
) => void | Promise<void>

export interface ConfigOptions {
  dev: boolean

  root?: string

  distDir?: string

  vite?: unknown

  viteConfig?: string

  bundle: BundleInfo

  renderer: Record<string, unknown> | string

  createRenderFunction?: (
    clientModule: ClientModule,
    scope: FastifyInstance,
    config: RuntimeConfig,
  ) => RenderFunction | Promise<RenderFunction>

  clientModule?: string

  spa: boolean

  virtualModulePrefix: string

  /** URL prefix for static asset routes in production mode */
  prefix?: string

  prepareServer: (scope: FastifyInstance, config: RuntimeConfig) => void

  prepareClient: (
    entries: ClientEntries,
    scope: FastifyInstance,
    config: RuntimeConfig,
  ) => Promise<ClientModule | undefined>

  createHtmlTemplateFunction: CreateHtmlTemplateFunction

  createHtmlFunction: CreateHtmlFunction

  createRoute: CreateRoute

  createRouteHandler: CreateRouteHandler

  createErrorHandler: CreateErrorHandler
}

interface BaseRuntimeConfig extends Omit<ConfigOptions, 'dev' | 'vite'> {
  hasRenderFunction?: boolean
  ssrManifest?: unknown
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
