import type RouteContext from '../context.ts'

/**
 * Module augmentation for Fastify to expose the per-request `route`
 * context that @fastify/vue decorates onto `FastifyRequest` during the
 * `onRequest` hook. `FastifyReply.html()` and `.render()` are already
 * augmented by `@fastify/vite`, so we only need to add `request.route`
 * here to get end-to-end typing inside route handlers.
 */
declare module 'fastify' {
  interface FastifyRequest {
    route: RouteContext
  }
}
