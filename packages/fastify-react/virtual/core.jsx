import { createPath } from 'history'
import { createContext, useContext, useEffect } from 'react'
import { BrowserRouter, useLocation } from 'react-router-dom'
import { StaticRouter } from 'react-router-dom/server.mjs'
import { proxy, useSnapshot } from 'valtio'
import layouts from '/:layouts.js'
import { waitFetch, waitResource } from '/:resource.js'

export const isServer = import.meta.env.SSR
export const Router = isServer ? StaticRouter : BrowserRouter
export const RouteContext = createContext({})

export function useRouteContext() {
  const routeContext = useContext(RouteContext)
  if (routeContext.state) {
    routeContext.snapshot = isServer
      ? routeContext.state ?? {}
      : useSnapshot(routeContext.state ?? {})
  }
  return routeContext
}

let serverActionCounter = 0

export function createServerAction(name) {
  return `/-/action/${name ?? serverActionCounter++}`
}

export function useServerAction(action, options = {}) {
  if (import.meta.env.SSR) {
    const { req, server } = useRouteContext()
    req.route.actionData[action] = waitFetch(
      `${server.serverURL}${action}`,
      options,
      req.fetchMap,
    )
    return req.route.actionData[action]
  }
  const { actionData } = useRouteContext()
  if (actionData[action]) {
    return actionData[action]
  }
  actionData[action] = waitFetch(action, options)
  return actionData[action]
}

export function AppRoute({ head, ctxHydration, ctx, children }) {
  // If running on the server, assume all data
  // functions have already ran through the preHandler hook
  if (isServer) {
    const Layout = layouts[ctxHydration.layout ?? 'default']
    return (
      <RouteContext.Provider
        value={{
          ...ctx,
          ...ctxHydration,
          state: isServer
            ? ctxHydration.state ?? {}
            : proxy(ctxHydration.state ?? {}),
        }}
      >
        <Layout>{children}</Layout>
      </RouteContext.Provider>
    )
  }
  // Note that on the client, window.route === ctxHydration

  // Indicates whether or not this is a first render on the client
  ctx.firstRender = window.route.firstRender

  // If running on the client, the server context data
  // is still available, hydrated from window.route
  if (ctx.firstRender) {
    ctx.data = window.route.data
    ctx.head = window.route.head
  } else {
    ctx.data = undefined
    ctx.head = undefined
  }

  const location = useLocation()
  const path = createPath(location)

  // When the next route renders client-side,
  // force it to execute all URMA hooks again
  // biome-ignore lint/correctness/useExhaustiveDependencies: I'm inclined to believe you, Biome, but I'm not risking it.
  useEffect(() => {
    window.route.firstRender = false
    window.route.actionData = {}
  }, [location])

  // If we have a getData function registered for this route
  if (!ctx.data && ctx.getData) {
    try {
      const { pathname, search } = location
      // If not, fetch data from the JSON endpoint
      ctx.data = waitFetch(`/-/data${pathname}${search}`)
    } catch (status) {
      // If it's an actual error...
      if (status instanceof Error) {
        ctx.error = status
      }
      // If it's just a promise (suspended state)
      throw status
    }
  }

  // Note that ctx.loader() at this point will resolve the
  // memoized module, so there's barely any overhead

  if (!ctx.firstRender && ctx.getMeta) {
    const updateMeta = async () => {
      const { getMeta } = await ctx.loader()
      head.update(await getMeta(ctx))
    }
    waitResource(path, 'updateMeta', updateMeta)
  }

  if (!ctx.firstRender && ctx.onEnter) {
    const runOnEnter = async () => {
      const { onEnter } = await ctx.loader()
      const updatedData = await onEnter(ctx)
      if (!ctx.data) {
        ctx.data = {}
      }
      Object.assign(ctx.data, updatedData)
    }
    waitResource(path, 'onEnter', runOnEnter)
  }

  const Layout = layouts[ctx.layout ?? 'default']

  return (
    <RouteContext.Provider
      value={{
        ...ctxHydration,
        ...ctx,
        state: isServer
          ? ctxHydration.state ?? {}
          : proxy(ctxHydration.state ?? {}),
      }}
    >
      <Layout>{children}</Layout>
    </RouteContext.Provider>
  )
}
