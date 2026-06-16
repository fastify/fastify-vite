import type { FastifyInstance, RouteHandlerMethod, RouteOptions } from 'fastify'
import type { ClientEntries, ClientModule } from './client.ts'
import type { RuntimeConfig } from './options.ts'
import type { ReplyDotHtmlFunction, ReplyDotRenderFunction } from './reply.ts'
import type { ClientRouteArgs, CreateRouteArgs } from './route.ts'

/** Renderer option interface for custom renderers */
export interface RendererOption {
  clientModule: string

  createHtmlTemplateFunction(source: string): unknown

  createHtmlFunction(
    source: string,
    scope: FastifyInstance,
    config: RuntimeConfig,
  ): ReplyDotHtmlFunction | Promise<ReplyDotHtmlFunction>

  createRenderFunction(
    client: ClientModule,
    scope: FastifyInstance,
    config: RuntimeConfig,
  ): Promise<ReplyDotRenderFunction>

  createErrorHandler(
    args: ClientRouteArgs,
    scope: FastifyInstance,
    config: RuntimeConfig,
  ): NonNullable<RouteOptions['errorHandler']> | Promise<NonNullable<RouteOptions['errorHandler']>>

  createRoute(
    args: CreateRouteArgs,
    scope: FastifyInstance,
    config: RuntimeConfig,
  ): void | Promise<void>

  createRouteHandler(
    args: ClientRouteArgs,
    scope: FastifyInstance,
    config: RuntimeConfig,
  ): RouteHandlerMethod | Promise<RouteHandlerMethod>

  prepareClient(
    entries: ClientEntries,
    scope: FastifyInstance,
    config: RuntimeConfig,
  ): Promise<ClientModule | null>
}
