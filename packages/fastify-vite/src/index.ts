import type {
  FastifyError,
  FastifyInstance,
  FastifyPluginCallback,
  FastifyReply,
  FastifyRequest,
} from 'fastify'
import type { ViteDevServer } from 'vite'
import type { ModuleRunner } from 'vite/module-runner'
import fp from 'fastify-plugin'
import { configure } from './config.ts'
import { hasIterableRoutes, type FastifyViteDecorationPriorToSetup } from './mode/support.ts'
import type { ClientEntries, ClientModule } from './types/client.ts'
import type {
  DevRuntimeConfig,
  FastifyViteOptions,
  ProdRuntimeConfig,
  RuntimeConfig,
} from './types/options.ts'
import type { ReplyDotRenderContext, ReplyDotRenderResult } from './types/reply.ts'
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
  setup: (ctx: FastifyViteDecorationPriorToSetup) => Promise<ClientModule | undefined>
  hot?: symbol
}

const kMode = Symbol('kMode')
const kOptions = Symbol('kOptions')

class FastifyViteDecoration implements FastifyViteDecorationPriorToSetup {
  scope: FastifyInstance
  createServer?: unknown
  runtimeConfig!: RuntimeConfig
  devServer?: ViteDevServer
  entries?: ClientEntries
  runners?: Record<string, ModuleRunner>;
  [key: symbol]: unknown

  private [kOptions]: FastifyViteOptions
  private [kMode]!: ModeModule

  constructor(scope: FastifyInstance, options: FastifyViteOptions) {
    this.scope = scope
    this.createServer = (options as unknown as { createServer?: unknown }).createServer
    this[kOptions] = options
  }

  /**
   * Completes @fastify/vite runtime initialization.
   *
   * This is intentionally not run during plugin registration; call
   * `await server.vite.ready()` when your app is ready to start Vite setup,
   * decorate reply methods, and register client-derived routes.
   */
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

    // Get client module based on the Vite server bundle
    const client = await this[kMode].setup(this)

    // Register individual Fastify routes for each the client-provided routes
    if (hasIterableRoutes(client)) {
      for (const route of client.routes) {
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
            return await handler.call(this.scope, req, reply)
          }
          const hmrErrorHandler = async (
            error: FastifyError,
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
            return await errorHandler.call(this.scope, error, req, reply)
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
