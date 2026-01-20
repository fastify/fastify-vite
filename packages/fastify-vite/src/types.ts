import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { Manifest, ResolvedConfig as ViteResolvedConfig, UserConfig } from 'vite'

/** User-provided options for the @fastify/vite plugin */
export interface FastifyViteOptions extends Partial<RendererOption> {
  dev?: boolean
  root: string
  spa?: boolean
  renderer?: string | Partial<RendererOption>
  vite?: UserConfig
  viteConfig?: string
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
}

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
export interface ExtendedResolvedViteConfig extends ViteResolvedConfig, WithFastifyConfig {}

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

/** Keys from RendererOption that need different signatures in ResolvedConfig */
type RendererFunctionKeys =
  | 'prepareClient'
  | 'createHtmlTemplateFunction'
  | 'createHtmlFunction'
  | 'createRenderFunction'
  | 'createRoute'
  | 'createRouteHandler'
  | 'createErrorHandler'
  | 'clientModule'

/** Internal resolved configuration after defaults and renderer merged */
export interface ResolvedFastifyViteConfig extends Required<
  Omit<
    FastifyViteOptions,
    'bundle' | 'vite' | 'renderer' | 'viteConfig' | 'distDir' | 'prefix' | RendererFunctionKeys
  >
> {
  // These stay optional (filled in by configure())
  viteConfig?: string
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

  createHtmlTemplateFunction: CreateHtmlTemplateFunction

  createHtmlFunction: CreateHtmlFunction

  createRoute: CreateRoute

  createRouteHandler: CreateRouteHandler

  createErrorHandler: CreateErrorHandler

  createRenderFunction?: (
    clientModule: ClientModule,
    scope: FastifyInstance,
    config: RuntimeConfig,
  ) => RenderFunction | Promise<RenderFunction>
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
