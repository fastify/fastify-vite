import type { FastifyInstance, HTTPMethods } from 'fastify'
import type { UseHeadInput } from '@unhead/vue'
import type { App } from 'vue'
import type { Router } from 'vue-router'
import type RouteContext from '../context.ts'

/**
 * Minimal route definition used internally by `RouteContext` and the
 * routing layer. This is the shape carried through @fastify/vue's runtime,
 * independent of the user's route module exports.
 */
export interface RouteDefinition {
  id?: string
  path?: string
  key?: string
  meta?: Record<string, unknown>
  layout?: string
  streaming?: boolean
  clientOnly?: boolean
  serverOnly?: boolean
  data?: unknown
  getData?: unknown
  getMeta?: unknown
  onEnter?: unknown
  [key: string]: unknown
}

/**
 * Full shape of a Vue route module as expected by `createRoute`. This
 * describes what a `pages/*.vue` file or a manually registered route can
 * export to participate in the @fastify/vue runtime.
 */
export interface VueRouteDefinition extends RouteDefinition {
  id: string
  path: string
  method?: HTTPMethods | HTTPMethods[]
  dataPath?: string
  configure?: (scope: FastifyInstance) => Promise<void> | void
  getData?: (ctx: RouteContext) => Promise<Record<string, unknown>> | Record<string, unknown>
  getMeta?: (ctx: RouteContext) => Promise<UseHeadInput> | UseHeadInput
  onEnter?: (
    ctx: RouteContext,
  ) => Promise<Record<string, unknown> | void> | Record<string, unknown> | void
}

/**
 * Route shape carried through the runtime once `createRoutes` has assigned
 * the routing keys. Used by `rendering.ts` and `routing.ts` to look up the
 * matched route by `key`.
 */
export interface KeyedRoute extends RouteDefinition {
  key: string
}

/**
 * Factory that the host app's `$app/create` virtual module exports. Builds a
 * Vue app + router pair, optionally returning a store, for a given request.
 */
export type CreateFactory = (opts: {
  routes: KeyedRoute[]
  routeMap: Record<string, KeyedRoute>
  ctxHydration: RouteContext
  url: string
}) => Promise<{ instance: App; router: Router; store?: unknown }>
