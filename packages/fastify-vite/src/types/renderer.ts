import type { FastifyInstance, RouteHandlerMethod, RouteOptions } from 'fastify'
import type { ClientEntries, ClientModule } from './client.ts'
import type { ClientRouteArgs, CreateRouteArgs } from './route.ts'

/** Renderer function definitions */
export interface RendererFunctions {
  createHtmlTemplateFunction(source: string): unknown
  createHtmlFunction(
    source: string,
    scope?: FastifyInstance,
    config?: unknown,
  ): Promise<(...args: unknown[]) => unknown>
  createRenderFunction(
    client: ClientModule,
    scope?: FastifyInstance,
    config?: unknown,
  ): Promise<(...args: unknown[]) => unknown>
}

/** Renderer option interface for custom renderers */
export interface RendererOption extends RendererFunctions {
  clientModule: string
  createErrorHandler(
    args: ClientRouteArgs,
    scope: FastifyInstance,
    config?: unknown,
  ): NonNullable<RouteOptions['errorHandler']> | Promise<NonNullable<RouteOptions['errorHandler']>>
  createRoute(args: CreateRouteArgs, scope: FastifyInstance, config: unknown): void | Promise<void>
  createRouteHandler(
    args: ClientRouteArgs,
    scope: FastifyInstance,
    config?: unknown,
  ): RouteHandlerMethod | Promise<RouteHandlerMethod>
  prepareClient(
    entries: ClientEntries,
    scope?: FastifyInstance,
    config?: unknown,
  ): Promise<ClientModule | null>
}
