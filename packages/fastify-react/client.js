import { createContext, useContext, lazy } from 'react'
import { useSnapshot } from 'valtio'

export const RouteContext = createContext({})
export const isServer = typeof window === 'undefined' && typeof process === 'object'

export function useRouteContext() {
  const routeContext = useContext(RouteContext)
  if (routeContext.state) {
    routeContext.snapshot = isServer
      ? routeContext.state ?? {}
      : useSnapshot(routeContext.state ?? {})
  }
  return routeContext
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
    route.component = lazy(() => route.loader())
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
