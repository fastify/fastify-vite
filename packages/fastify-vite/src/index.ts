import type { FastifyInstance, FastifyPluginCallback, FastifyReply, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'
import { configure } from './config.ts'
import type {
  DevRuntimeConfig,
  FastifyViteOptions,
  ProdRuntimeConfig,
  RuntimeConfig,
} from './types/options.ts'
import type { DecoratedReply, ReplyDotRenderContext, ReplyDotRenderResult } from './types/reply.ts'
import type { RouteDefinition } from './types/route.ts'

// Re-export types for consumers
export type {
  DevRuntimeConfig,
  FastifyViteOptions,
  ProdRuntimeConfig,
  ReplyDotRenderContext as RenderContext,
  RouteDefinition,
  RuntimeConfig,
}

// Module augmentation for Fastify
declare module 'fastify' {
  interface FastifyReply {
    html(ctx?: ReplyDotRenderResult): FastifyReply | Promise<FastifyReply>
    render(ctx?: ReplyDotRenderContext): ReplyDotRenderResult | Promise<ReplyDotRenderResult>
  }

  interface FastifyInstance {
    vite: FastifyViteDecoration
  }
}

interface ModeModule {
  setup: (
    this: FastifyViteDecoration,
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

class FastifyViteDecoration {
  scope: FastifyInstance
  createServer?: unknown
  runtimeConfig!: RuntimeConfig
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
    this.runtimeConfig = await configure(this[kOptions])

    // Configure the Fastify server instance — used mostly by renderer packages
    if (this.runtimeConfig.prepareServer) {
      await this.runtimeConfig.prepareServer(this.scope, this.runtimeConfig)
    }

    // Determine which setup function to use
    if (this.runtimeConfig.dev) {
      // Boots Vite's development server and ensures hot reload
      this[kMode] = (await import('./mode/development.ts')) as ModeModule
    } else {
      // Assumes presence of and uses production bundled distribution
      this[kMode] = (await import('./mode/production.ts')) as ModeModule
    }

    // Get handler function and routes based on the Vite server bundle
    const { client, routes } = await this[kMode].setup.call(
      this,
      this.runtimeConfig,
      this.createServer,
    )

    // Register individual Fastify routes for each the client-provided routes
    if (routes && typeof (routes as Iterable<RouteDefinition>)[Symbol.iterator] === 'function') {
      for (const route of routes as Iterable<RouteDefinition>) {
        if (this.runtimeConfig.dev) {
          const hotSymbol = this[kMode].hot!
          const hmrHandler = async (req: FastifyRequest, reply: FastifyReply) => {
            // Create route handler and route error handler functions
            const handler = await this.runtimeConfig.createRouteHandler(
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
              this.runtimeConfig,
            )
            return await handler(req, reply as DecoratedReply)
          }
          const hmrErrorHandler = async (
            error: Error,
            req: FastifyRequest,
            reply: FastifyReply,
          ) => {
            const errorHandler = await this.runtimeConfig.createErrorHandler(
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
              this.runtimeConfig,
            )
            return await errorHandler(error, req, reply)
          }

          await this.runtimeConfig.createRoute(
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
            this.runtimeConfig,
          )
        } else {
          // Create route handler and route error handler functions
          const handler = await this.runtimeConfig.createRouteHandler(
            { client, route },
            this.scope,
            this.runtimeConfig,
          )

          const errorHandler = await this.runtimeConfig.createErrorHandler(
            {
              client,
              route,
            },
            this.scope,
            this.runtimeConfig,
          )

          await this.runtimeConfig.createRoute(
            {
              client,
              handler,
              errorHandler,
              route,
            },
            this.scope,
            this.runtimeConfig,
          )
        }
      }
    }
  }
}

const pluginFn: FastifyPluginCallback<FastifyViteOptions> = (scope, options, done) => {
  scope.decorate('vite', new FastifyViteDecoration(scope, options))
  done()
}

const fastifyVite = fp(pluginFn, {
  fastify: '5.x',
  name: '@fastify/vite',
})

export default fastifyVite
export { fastifyVite }
