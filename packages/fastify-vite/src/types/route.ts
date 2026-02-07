import type { FastifyInstance, RouteOptions } from 'fastify'

export interface RouteDefinition extends Partial<RouteOptions> {
  configure?: (scope: FastifyInstance) => void | Promise<void>
  default?: (...args: unknown[]) => unknown
  // Runtime composes/injects the handler (`createRouteHandler`, plus HMR wrappers in dev).
  handler?: never
  path?: string
  // Runtime sets Fastify's `url` during registration (derived from `path`).
  url?: never
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
