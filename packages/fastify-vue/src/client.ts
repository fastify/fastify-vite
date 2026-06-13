import { inject } from 'vue'
import {
  useRoute,
  createMemoryHistory,
  createWebHistory,
  type RouteLocationNormalized,
} from 'vue-router'
import type { Ref } from 'vue'
import type { UseHeadInput } from '@unhead/vue'
import type { BeforeEachHandlerArgs, CtxHydration, RouteContextLike } from './types/client.ts'

export type { BeforeEachHandlerArgs, CtxHydration, RouteContextLike }

export const isServer = typeof window === 'undefined' && typeof process === 'object'
export const createHistory = isServer ? createMemoryHistory : createWebHistory
export const serverRouteContext = Symbol('serverRouteContext')
export const routeLayout = Symbol('routeLayout')

export function useRouteContext<T = RouteContextLike>(): T {
  if (isServer) {
    return inject(serverRouteContext) as T
  }
  return (useRoute().meta as Record<symbol, T>)[serverRouteContext] as T
}

export function createBeforeEachHandler(
  { routeMap, ctxHydration }: BeforeEachHandlerArgs,
  layout: Ref<string>,
) {
  return async function beforeCreate(to: RouteLocationNormalized) {
    // The client-side route context
    const ctx = routeMap[to.matched[0].path]
    // Indicates whether or not this is a first render on the client
    ctx.firstRender = ctxHydration.firstRender

    ctx.state = ctxHydration.state
    ctx.actions = ctxHydration.actions

    // Update layoutRef
    layout.value = ctx.layout ?? 'default'

    // If it is, take server context data from hydration and return immediately
    if (ctx.firstRender) {
      ctx.data = ctxHydration.data as Record<string, unknown> | undefined
      ctx.head = ctxHydration.head
      // Ensure this block doesn't run again during client-side navigation
      ctxHydration.firstRender = false
      ;(to.meta as Record<symbol, unknown>)[serverRouteContext] = ctx
      return
    }

    // If we have a getData function registered for this route
    if (ctx.getData) {
      try {
        ctx.data = (await jsonDataFetch(to.fullPath)) as Record<string, unknown> | undefined
      } catch (error) {
        ctx.error = error
      }
    }
    // Note that ctx.loader() at this point will resolve the
    // memoized module, so there's barely any overhead
    const loader = ctx.loader as () => Promise<{
      getMeta?: (ctx: RouteContextLike) => UseHeadInput | Promise<UseHeadInput>
      onEnter?: (ctx: RouteContextLike) => Record<string, unknown> | undefined
    }>
    const { getMeta, onEnter } = await loader()
    if (ctx.getMeta && getMeta) {
      ctx.head = await getMeta(ctx)
      ctxHydration.useHead.push(ctx.head)
    }
    if (ctx.onEnter && onEnter) {
      const updatedData = await onEnter(ctx)
      if (updatedData) {
        if (!ctx.data) {
          ctx.data = {}
        }
        Object.assign(ctx.data, updatedData)
      }
    }
    ;(to.meta as Record<symbol, unknown>)[serverRouteContext] = ctx
  }
}

interface HydratedRoute {
  id: string
  path: string
  loader: () => Promise<Record<string, unknown>>
  component: () => Promise<Record<string, unknown>>
  [key: string]: unknown
}

export async function hydrateRoutes(
  from: Record<string, () => Promise<Record<string, unknown>>>,
): Promise<HydratedRoute[]> {
  const windowRoutes = (window as unknown as { routes: Array<HydratedRoute & { id: string }> })
    .routes
  return windowRoutes.map((route) => {
    route.loader = memoImport(from[route.id])
    route.component = () => route.loader()
    return route
  })
}

function memoImport(
  func: () => Promise<Record<string, unknown>>,
): () => Promise<Record<string, unknown>> {
  let executed = false
  let value: Record<string, unknown>
  return async () => {
    if (!executed) {
      value = await func()
      executed = true
    }
    return value
  }
}

export async function jsonDataFetch(path: string): Promise<unknown> {
  const response = await fetch(`/-/data${path}`)
  let data: unknown
  let error: unknown
  try {
    data = await response.json()
  } catch (err) {
    error = err
  }
  if ((data as { statusCode?: number })?.statusCode === 500) {
    throw new Error((data as { message: string }).message)
  }
  if (error) {
    throw error
  }
  return data
}
