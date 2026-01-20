import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { Manifest, ResolvedConfig, UserConfig } from 'vite'

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

export interface Bundle {
  manifest?: Manifest
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

// Renderer types for plugin configuration

/** Helper type to loosen strict object types by adding index signature */
export type Loosen<T> = T & Record<string, unknown>

/** Route properties available in renderer context */
export type RouteType = Partial<{
  server: unknown
  req: unknown
  reply: unknown
  head: unknown
  state: unknown
  data: Record<string, unknown>
  firstRender: boolean
  layout: unknown
  getMeta: unknown
  getData: unknown
  onEnter: unknown
  streaming: unknown
  clientOnly: unknown
  serverOnly: unknown
}>

/** Renderer context passed to html/render functions */
export type Ctx = Loosen<{
  routes: Array<RouteType>
  context: unknown
  body: unknown
  stream: unknown
  data: unknown
}>

/** Renderer function definitions */
export interface RendererFunctions {
  createHtmlTemplateFunction(source: string): unknown
  createHtmlFunction(
    source: string,
    scope?: unknown,
    config?: unknown,
  ): (ctx: Ctx) => Promise<unknown>
  createRenderFunction(
    args: Loosen<{
      routes?: Array<RouteType>
      create?: (arg0: Record<string, unknown>) => unknown
      createApp: unknown
    }>,
  ): Promise<
    (
      server: unknown,
      req: unknown,
      reply: unknown,
    ) =>
      | (Ctx | { element: string; hydration?: string })
      | Promise<Ctx | { element: string; hydration?: string }>
  >
}

/** Renderer option interface for custom renderers */
export interface RendererOption<
  CM = string | Record<string, unknown> | unknown,
  C = unknown,
> extends RendererFunctions {
  clientModule: CM
  createErrorHandler(
    client: C,
    scope: FastifyInstance,
    config?: unknown,
  ): (error: Error, req?: FastifyRequest, reply?: FastifyReply) => void
  createRoute(
    args: Loosen<{
      client?: C
      handler?: (...args: unknown[]) => unknown
      errorHandler: (error: Error, req?: FastifyRequest, reply?: FastifyReply) => void
      route?: RouteType
    }>,
    scope: FastifyInstance,
    config: unknown,
  ): void
  createRouteHandler(
    client: C,
    scope: FastifyInstance,
    config?: unknown,
  ): (req: FastifyRequest, reply: FastifyReply) => Promise<unknown>
  prepareClient(clientModule: CM, scope?: FastifyInstance, config?: unknown): Promise<C>
}

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

/** Base args containing client and route, used by route handlers */
export type ClientRouteArgs = {
  client?: unknown
  route?: RouteDefinition
}

export type CreateRouteHandler = (
  args: ClientRouteArgs,
  scope: FastifyInstance,
  config: RuntimeConfig,
) => RouteHandler

export type ErrorHandler = (error: Error, req: FastifyRequest, reply: FastifyReply) => void

export type CreateErrorHandler = (
  args: ClientRouteArgs,
  scope: FastifyInstance,
  config: RuntimeConfig,
) => ErrorHandler

/** Full args for createRoute including handler and error handler */
export type CreateRouteArgs = ClientRouteArgs & {
  handler?: RouteHandler
  errorHandler: ErrorHandler
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

  bundle: Bundle

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
