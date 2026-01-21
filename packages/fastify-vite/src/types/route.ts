import type { FastifyInstance } from 'fastify'

export interface RouteDefinition {
  path?: string
  method?: string
  configure?: (scope: FastifyInstance) => void | Promise<void>
  default?: (...args: unknown[]) => unknown
  [key: string]: unknown
}

/** Base args containing client and route, used by route handlers */
export interface ClientRouteArgs {
  client?: unknown
  route?: RouteDefinition
}
