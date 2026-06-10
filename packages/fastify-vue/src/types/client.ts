import type { UseHeadInput, VueHeadClient } from '@unhead/vue'

/**
 * Loose route context shape used on the client. The real `RouteContext`
 * class from `src/context.ts` is server-side only; this is what the client
 * sees after hydration and what `useRouteContext()` returns by default.
 */
export interface RouteContextLike {
  firstRender: boolean
  state: unknown
  actions: unknown
  data?: Record<string, unknown>
  head?: UseHeadInput
  error?: unknown
  layout?: string
  getData?: boolean
  getMeta?: boolean
  onEnter?: boolean
  loader?: () => Promise<Record<string, unknown>>
  [key: string]: unknown
}

/**
 * Hydration context passed to the client-side before-each handler. Extends
 * `RouteContextLike` with the `useHead` sink used to push meta tags during
 * client-side navigation.
 */
export interface CtxHydration extends RouteContextLike {
  useHead: VueHeadClient
}

/**
 * Arguments for `createBeforeEachHandler`. `routeMap` is the key→context
 * lookup built from the hydrated routes list, and `ctxHydration` is the
 * SSR-provided initial context the first client render uses.
 */
export interface BeforeEachHandlerArgs {
  routeMap: Record<string, RouteContextLike>
  ctxHydration: CtxHydration
}
