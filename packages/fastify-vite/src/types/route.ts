import type { FastifyInstance, RouteOptions } from 'fastify'

// TODO: Revisit whether omitting `url`/`handler` is strictly needed or if we can simplify route merge/runtime behavior.
export interface RouteDefinition extends Partial<Omit<RouteOptions, 'url' | 'handler'>> {
  path?: string
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
