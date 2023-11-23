import { createContext, useContext, useEffect } from 'react'
import { useLocation, BrowserRouter } from 'react-router-dom'
import { StaticRouter } from 'react-router-dom/server.mjs'
import { createPath } from 'history'
import { proxy, useSnapshot } from 'valtio'
import { waitResource, waitFetch } from '/:resource.js'
import layouts from '/:layouts.js'

export const isServer = import.meta.env.SSR
export const Router = isServer ? StaticRouter : BrowserRouter
export const RouteContext = createContext({})

export function useRouteContext () {
  const routeContext = useContext(RouteContext)
  if (routeContext.state) {
    routeContext.snapshot = isServer
      ? routeContext.state ?? {}
      : useSnapshot(routeContext.state ?? {})
  }
  return routeContext
}

export function AppRoute ({ head, ctxHydration, ctx, children }) {
  // If running on the server, assume all data
  // functions have already ran through the preHandler hook
  if (isServer) {
    const Layout = layouts[ctxHydration.layout ?? 'default']
    return (
      <RouteContext.Provider value={{
        ...ctx,
        ...ctxHydration,
        state: isServer
          ? ctxHydration.state ?? {}
          : proxy(ctxHydration.state ?? {}),
      }}>
        <Layout>
          {children}
        </Layout>
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
  }

  const location = useLocation()
  const path = createPath(location)

  // When the next route renders client-side,
  // force it to execute all URMA hooks again
  useEffect(() => {
    window.route.firstRender = false
  }, [location])

  // If we have a getData function registered for this route
  if (!ctx.data && ctx.getData) {
    try {
      const { pathname, search } = location
      // If not, fetch data from the JSON endpoint
      ctx.data = waitFetch(`${pathname}${search}`)
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
    <RouteContext.Provider value={{
      ...ctxHydration,
      ...ctx,
      state: isServer
        ? ctxHydration.state ?? {}
        : proxy(ctxHydration.state ?? {}),
    }}>
      <Layout>
        {children}
      </Layout>
    </RouteContext.Provider>
  )
}
