import type { FastifyInstance, FastifyPluginCallback, FastifyReply, FastifyRequest } from 'fastify'
import type { Manifest, UserConfig } from 'vite'
import fp from 'fastify-plugin'
import { configure } from './config.ts'
import type {
  Bundle,
  ClientEntries,
  ClientModule,
  ClientRouteArgs,
  CreateErrorHandler,
  CreateHtmlFunction,
  CreateHtmlTemplateFunction,
  CreateRoute,
  CreateRouteArgs,
  CreateRouteHandler,
  Ctx,
  DecoratedReply,
  DevRuntimeConfig,
  HtmlFunction,
  Loosen,
  ProdRuntimeConfig,
  RenderContext,
  RendererFunctions,
  RendererOption,
  RenderFunction,
  RenderResult,
  RouteDefinition,
  RouteType,
  RuntimeConfig,
} from './types.ts'

// Re-export types for consumers
export type {
  Bundle,
  ClientEntries,
  ClientModule,
  ClientRouteArgs,
  CreateErrorHandler,
  CreateHtmlFunction,
  CreateHtmlTemplateFunction,
  CreateRoute,
  CreateRouteArgs,
  CreateRouteHandler,
  Ctx,
  DecoratedReply,
  DevRuntimeConfig,
  HtmlFunction,
  Loosen,
  ProdRuntimeConfig,
  RenderContext,
  RendererFunctions,
  RendererOption,
  RenderFunction,
  RenderResult,
  RouteDefinition,
  RouteType,
  RuntimeConfig,
}

// Module augmentation for Fastify
declare module 'fastify' {
  interface FastifyReply {
    html(ctx?: RenderResult): FastifyReply | Promise<FastifyReply>
    render(ctx?: RenderContext): RenderResult | Promise<RenderResult>
  }

  interface FastifyInstance {
    vite: Vite
  }
}

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

interface ModeModule {
  setup: (
    this: Vite,
    config: RuntimeConfig,
    createServer?: unknown,
  ) => Promise<{
    client: unknown
    routes?: Iterable<RouteDefinition>
    handler?: unknown
    errorHandler?: unknown
  }>
  hot?: symbol
}

const kMode = Symbol('kMode')
const kOptions = Symbol('kOptions')

class Vite {
  scope: FastifyInstance
  createServer?: unknown
  config!: RuntimeConfig
  devServer?: unknown
  entries?: Record<string, unknown>
  runners?: Record<string, unknown>;
  [key: symbol]: unknown

  private [kOptions]: FastifyViteOptions
  private [kMode]!: ModeModule

  constructor(scope: FastifyInstance, options: FastifyViteOptions) {
    this.scope = scope
    this.createServer = (options as unknown as { createServer?: unknown }).createServer
    this[kOptions] = options
  }

  async ready(): Promise<void> {
    // Process all user-provided options and compute all Vite configuration settings
    this.config = await configure(this[kOptions] as unknown as Parameters<typeof configure>[0])

    // Configure the Fastify server instance — used mostly by renderer packages
    if (this.config.prepareServer) {
      await this.config.prepareServer(this.scope, this.config)
    }

    // Determine which setup function to use
    if (this.config.dev) {
      // Boots Vite's development server and ensures hot reload
      this[kMode] = (await import('./mode/development.ts')) as ModeModule
    } else {
      // Assumes presence of and uses production bundled distribution
      this[kMode] = (await import('./mode/production.ts')) as ModeModule
    }

    // Get handler function and routes based on the Vite server bundle
    const { client, routes } = await this[kMode].setup.call(this, this.config, this.createServer)

    // Register individual Fastify routes for each the client-provided routes
    if (routes && typeof (routes as Iterable<RouteDefinition>)[Symbol.iterator] === 'function') {
      for (const route of routes as Iterable<RouteDefinition>) {
        if (this.config.dev) {
          const hotSymbol = this[kMode].hot!
          const hmrHandler = async (req: FastifyRequest, reply: FastifyReply) => {
            // Create route handler and route error handler functions
            const handler = await this.config.createRouteHandler(
              {
                client:
                  (this.scope as unknown as Record<symbol, { client?: unknown }>)[hotSymbol]
                    ?.client ?? client,
                route:
                  (
                    this.scope as unknown as Record<
                      symbol,
                      { routeHash?: Map<string, RouteDefinition> }
                    >
                  )[hotSymbol]?.routeHash?.get(route.path!) ?? route,
              },
              this.scope,
              this.config,
            )
            return await handler(req, reply as DecoratedReply)
          }
          const hmrErrorHandler = async (
            error: Error,
            req: FastifyRequest,
            reply: FastifyReply,
          ) => {
            const errorHandler = await this.config.createErrorHandler(
              {
                client:
                  (this.scope as unknown as Record<symbol, { client?: unknown }>)[hotSymbol]
                    ?.client ?? client,
                route:
                  (
                    this.scope as unknown as Record<
                      symbol,
                      { routeHash?: Map<string, RouteDefinition> }
                    >
                  )[hotSymbol]?.routeHash?.get(route.path!) ?? route,
              },
              this.scope,
              this.config,
            )
            return await errorHandler(error, req, reply)
          }

          await this.config.createRoute(
            {
              client,
              route,
              async handler(...args: Parameters<typeof hmrHandler>) {
                return await hmrHandler(...args)
              },
              async errorHandler(...args: Parameters<typeof hmrErrorHandler>) {
                return await hmrErrorHandler(...args)
              },
            },
            this.scope,
            this.config,
          )
        } else {
          // Create route handler and route error handler functions
          const handler = await this.config.createRouteHandler(
            { client, route },
            this.scope,
            this.config,
          )

          const errorHandler = await this.config.createErrorHandler(
            {
              client,
              route,
            },
            this.scope,
            this.config,
          )

          await this.config.createRoute(
            {
              client,
              handler,
              errorHandler,
              route,
            },
            this.scope,
            this.config,
          )
        }
      }
    }
  }
}

const plugin: FastifyPluginCallback<FastifyViteOptions> = (scope, options, done) => {
  scope.decorate('vite', new Vite(scope, options))
  done()
}

const fastifyVite = fp(plugin, {
  fastify: '5.x',
  name: '@fastify/vite',
})

export default fastifyVite
export { fastifyVite }
