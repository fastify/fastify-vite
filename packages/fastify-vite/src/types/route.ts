import type { FastifyInstance, RouteOptions } from 'fastify'

export interface RouteDefinition {
  path?: string
  method?: RouteOptions['method']
  configure?: (scope: FastifyInstance) => void | Promise<void>
  default?: (...args: unknown[]) => unknown
  [key: string]: unknown
}

/** Base args containing client and route, used by route handlers */
export interface ClientRouteArgs {
  client?: unknown
  route?: RouteDefinition
}

/** Full args for createRoute including handler and error handler */
export interface CreateRouteArgs
  extends ClientRouteArgs, Pick<RouteOptions, 'handler' | 'errorHandler'> {}
