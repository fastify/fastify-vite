// Side-effect import: augments `fastify` with `FastifyRequest.route`
import './types/reply.ts'

export { prepareClient, createErrorHandler, createRoute } from './routing.ts'

export { createRenderFunction, createHtmlFunction } from './rendering.ts'

export const clientModule = '$app/index.js'

export { default as RouteContext } from './context.ts'

// Re-export public types
export type { ViteFastifyVueOptions } from './types/options.ts'
export type { RouteDefinition, VueRouteDefinition } from './types/route.ts'
export type { ContextInit } from './types/context.ts'
export type {
  BeforeEachHandlerArgs,
  CtxHydration,
  RouteContextLike,
} from './types/client.ts'
