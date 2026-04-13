import type { FastifyInstance, RouteHandlerMethod, RouteOptions } from 'fastify'
import type { RouteDefinition } from './route.ts'

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
  ): Promise<(ctx?: Ctx) => unknown>
  createRenderFunction(client: Record<string, unknown>): Promise<(...args: unknown[]) => unknown>
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
  ): NonNullable<RouteOptions['errorHandler']> | Promise<NonNullable<RouteOptions['errorHandler']>>
  createRoute(
    args: Loosen<{
      client?: C
      handler?: RouteHandlerMethod
      errorHandler: NonNullable<RouteOptions['errorHandler']>
      route?: RouteDefinition
    }>,
    scope: FastifyInstance,
    config: unknown,
  ): void | Promise<void>
  createRouteHandler(
    client: C,
    scope: FastifyInstance,
    config?: unknown,
  ): RouteHandlerMethod | Promise<RouteHandlerMethod>
  prepareClient(clientModule: CM, scope?: FastifyInstance, config?: unknown): Promise<C>
}
