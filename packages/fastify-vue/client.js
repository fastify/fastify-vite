import { inject } from 'vue'
import { useRoute, createMemoryHistory, createWebHistory } from 'vue-router'

export const isServer = typeof window === 'undefined' && typeof process === 'object'
export const createHistory = isServer ? createMemoryHistory : createWebHistory
export const serverRouteContext = Symbol('serverRouteContext')
export const routeLayout = Symbol('routeLayout')

export function useRouteContext () {
  if (isServer) {
    return inject(serverRouteContext)
  }
  return useRoute().meta[serverRouteContext]
}

export function createBeforeEachHandler ({ routeMap, ctxHydration, head }, layout) {
  return async function beforeCreate (to) {
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
      ctx.data = ctxHydration.data
      ctx.head = ctxHydration.head
      // Ensure this block doesn't run again during client-side navigation
      ctxHydration.firstRender = false
      to.meta[serverRouteContext] = ctx
      return
    }

    // If we have a getData function registered for this route
    if (ctx.getData) {
      try {
        ctx.data = await jsonDataFetch(to.fullPath)
      } catch (error) {
        ctx.error = error
      }
    }
    // Note that ctx.loader() at this point will resolve the
    // memoized module, so there's barely any overhead
    const { getMeta, onEnter } = await ctx.loader()
    if (ctx.getMeta) {
      head.update(await getMeta(ctx))
    }
    if (ctx.onEnter) {
      const updatedData = await onEnter(ctx)
      if (updatedData) {
        if (!ctx.data) {
          ctx.data = {}
        }
        Object.assign(ctx.data, updatedData)
      }
    }
    to.meta[serverRouteContext] = ctx
  }
}

export async function hydrateRoutes (fromInput) {
  let from = fromInput
  if (Array.isArray(from)) {
    from = Object.fromEntries(
      from.map((route) => [route.path, route]),
    )
  }
  return window.routes.map((route) => {
    route.loader = memoImport(from[route.id])
    route.component = () => route.loader()
    return route
  })
}

function memoImport (func) {
  // Otherwise we get a ReferenceError, but since this function
  // is only ran once for each route, there's no overhead
  const kFuncExecuted = Symbol('kFuncExecuted')
  const kFuncValue = Symbol('kFuncValue')
  func[kFuncExecuted] = false
  return async () => {
    if (!func[kFuncExecuted]) {
      func[kFuncValue] = await func()
      func[kFuncExecuted] = true
    }
    return func[kFuncValue]
  }
}

export async function jsonDataFetch (path) {
  const response = await fetch(`/-/data${path}`)
  let data
  let error
  try {
    data = await response.json()
  } catch (err) {
    error = err
  }
  if (data?.statusCode === 500) {
    throw new Error(data.message)
  }
  if (error) {
    throw error
  }
  return data
}
