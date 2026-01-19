import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { createHtmlTemplateFunction } from '../html.ts'

export interface BundleInfo {
  manifest?: unknown
  indexHtml?: string
  dir?: string
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

export type CreateRoute = (
  args: {
    client?: unknown
    handler?: RouteHandler
    errorHandler: ErrorHandler
    route?: RouteDefinition
  },
  scope: FastifyInstance,
  config: RuntimeConfig,
) => void | Promise<void>

export interface ConfigOptions {
  dev: boolean

  /**
   *The location of your Vite configuration file.
   */
  root?: string

  /**
   * Override the directory to search for `vite.config.json` in production mode.
   * By default, the runtime automatically finds the app root via `package.json`
   * and searches in both `dist/` and `build/` folders.
   * Only specify this if you use a different folder name (e.g., `out`).
   * If a relative path is provided, it is resolved relative to the app root.
   */
  distDir?: string

  /**
   * Vite's resolved config
   */
  vite?: unknown

  /**
   * Vite's config path.
   * Automatically computed from root after resolveConfig()
   */
  viteConfig?: string

  /**
   * Vite's distribution bundle info.
   * Automatically computed from Vite's default settings
   */
  bundle: BundleInfo

  /**
   * Single object that can override all rendering settings that follow
   */
  renderer: Record<string, unknown> | string

  /**
   * Function to create SSR render function from server bundle
   */
  createRenderFunction?: (
    clientModule: ClientModule,
    scope: FastifyInstance,
    config: RuntimeConfig,
  ) => RenderFunction | Promise<RenderFunction>

  /**
   * Module bridging client code to the server, also referred to as the server entry point.
   * Automatically resolved from /index.(t|j)sx? if unset.
   */
  clientModule?: string

  /**
   * If true, disables SSR and disables loading of `clientModule`.
   * This lets you automate integration with a SPA Vite bundle
   */
  spa: boolean

  /**
   * When loading environments' entry points, @fastify/vite will recognize imports with this prefix
   * as virtual module imports and won't try to do any path resolving on them.
   */
  virtualModulePrefix: string

  /**
   * Docs TBD.
   */
  prepareServer: (scope: FastifyInstance, config: RuntimeConfig) => void

  /**
   * Docs TBD.
   */
  prepareClient: (
    entries: ClientEntries,
    scope: FastifyInstance,
    config: RuntimeConfig,
  ) => Promise<unknown>

  /**
   * Compile index.html into templating function, used by createHtmlFunction() by default
   */
  createHtmlTemplateFunction: CreateHtmlTemplateFunction

  /**
   * Create reply.html() response function
   */
  createHtmlFunction: CreateHtmlFunction

  /**
   * Register server routes for client routes
   */
  createRoute: CreateRoute

  /**
   * Create the route handler passed to createRoute
   */
  createRouteHandler: CreateRouteHandler

  /**
   * Create the route errorHandler passed to createRoute
   */
  createErrorHandler: CreateErrorHandler
}

export interface RuntimeConfig extends ConfigOptions {
  hasRenderFunction?: boolean
  ssrManifest?: unknown
}

export const DefaultConfig: ConfigOptions = {
  // Whether or not to enable Vite's Dev Server
  dev: process.argv.includes('--dev'),
  bundle: {
    manifest: undefined,
    indexHtml: undefined,
    dir: undefined, // deprecated
  },
  renderer: {},
  spa: false,

  virtualModulePrefix: '$app',

  prepareServer(scope, config) {},

  async prepareClient(entries, scope, config) {
    const clientModule = entries.ssr
    if (!clientModule) {
      return null
    }
    const routes =
      typeof clientModule.routes === 'function' ? await clientModule.routes() : clientModule.routes
    return Object.assign({}, clientModule, { routes })
  },

  createHtmlTemplateFunction,

  async createHtmlFunction(source, scope, config) {
    const indexHtmlTemplate = await config.createHtmlTemplateFunction(source)
    if (config.spa) {
      return function () {
        this.type('text/html')
        this.send(indexHtmlTemplate({ element: '' }))
        return this
      }
    }
    if (config.hasRenderFunction) {
      return async function (ctx) {
        this.type('text/html')
        this.send(await indexHtmlTemplate(ctx ?? (await this.render(ctx))))
        return this
      }
    }
    return async function (ctx) {
      this.type('text/html')
      this.send(await indexHtmlTemplate(ctx))
      return this
    }
  },

  async createRoute({ handler, errorHandler, route }, scope) {
    if (route.configure) {
      await route.configure(scope)
    }
    if (!route.path) {
      // throw new Error('Route missing `path` export.')
      return
    }
    scope.route({
      url: route.path,
      method: route.method ?? 'GET',
      handler,
      errorHandler,
      ...route,
    })
  },

  createRouteHandler({ client, route }, scope, config) {
    if (config.hasRenderFunction) {
      return async (req, reply) => {
        const page = await reply.render({
          app: scope,
          req,
          reply,
          client,
          route,
        })
        return reply.html(page)
      }
    }
    return async (req, reply) => {
      const page = await route.default({ app: scope, req, reply })
      return reply.html({
        app: scope,
        req,
        reply,
        client,
        route,
        element: page,
      })
    }
  },

  createErrorHandler({ client, route }, scope, config: RuntimeConfig) {
    return (error, req, reply) => {
      if (config.dev) {
        console.log(error)
        reply.code(500).type('application/json').send(JSON.stringify({ error }))
      } else {
        reply.code(500).send('')
      }
    }
  },
}
