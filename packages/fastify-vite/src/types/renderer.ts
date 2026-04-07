import type { FastifyInstance, RouteHandlerMethod, RouteOptions } from 'fastify'

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
  ): NonNullable<RouteOptions['errorHandler']> | Promise<NonNullable<RouteOptions['errorHandler']>>
  createRoute(
    args: Loosen<{
      client?: C
      handler?: RouteHandlerMethod
      errorHandler: NonNullable<RouteOptions['errorHandler']>
      route?: RouteType
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
