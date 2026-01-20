import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { ResolvedConfig } from 'vite'

export type ViteFastifyConfig = {
  clientModule?: string
  entryPaths?: Record<string, string>
  outDirs?: Record<string, string>
}

export interface ResolvedViteConfigWithFastify extends ResolvedConfig {
  fastify?: ViteFastifyConfig
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
  vite: ResolvedViteConfigWithFastify
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

export interface DecoratedReply extends FastifyReply {
  render?: (ctx?: RenderContext) => RenderResult | Promise<RenderResult>
  html?: (ctx?: RenderResult) => FastifyReply | Promise<FastifyReply>
}

export type HtmlTemplateFunction = (data?: RenderResult) => string

export type CreateHtmlTemplateFunction = (source: string) => Promise<HtmlTemplateFunction>

export type HtmlFunction = (
  this: DecoratedReply,
  ctx?: RenderResult,
) => DecoratedReply | Promise<DecoratedReply>

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

  prepareServer: (scope: FastifyInstance, config: RuntimeConfig) => void

  prepareClient: (
    entries: ClientEntries,
    scope: FastifyInstance,
    config: RuntimeConfig,
  ) => Promise<unknown>

  createHtmlTemplateFunction: CreateHtmlTemplateFunction

  createHtmlFunction: CreateHtmlFunction

  createRoute: CreateRoute

  createRouteHandler: CreateRouteHandler

  createErrorHandler: CreateErrorHandler
}

export interface RuntimeConfig extends ConfigOptions {
  hasRenderFunction?: boolean
  ssrManifest?: unknown
}
