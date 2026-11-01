import { createPath } from 'history'
import { useEffect } from 'react'
import { BrowserRouter, StaticRouter, useLocation } from 'react-router'
import { proxy } from 'valtio'
import { RouteContext, useRouteContext } from '@fastify/react/client'
import layouts from '$app/layouts.js'
import { waitFetch, waitResource } from '$app/resource.js'

export const isServer = import.meta.env.SSR
export const Router = isServer ? StaticRouter : BrowserRouter

let serverActionCounter = 0

export function createServerAction(name) {
  return `/-/action/${name ?? serverActionCounter++}`
}

export function useServerAction(action, options = {}) {
  if (import.meta.env.SSR) {
    const { req, server } = useRouteContext()
    req.route.actionData[action] = waitFetch(`${server.serverURL}${action}`, options, req.fetchMap)
    return req.route.actionData[action]
  }
  const { actionData } = useRouteContext()
  if (actionData[action]) {
    return actionData[action]
  }
  actionData[action] = waitFetch(action, options)
  return actionData[action]
}

export function AppRoute({ ctxHydration, ctx, children }) {
  // If running on the server, assume all data
  // functions have already ran through the preHandler hook
  if (isServer) {
    const Layout = layouts[ctxHydration.layout ?? 'default']
    return (
      <RouteContext.Provider
        value={{
          ...ctx,
          ...ctxHydration,
          state: isServer ? (ctxHydration.state ?? {}) : proxy(ctxHydration.state ?? {}),
        }}
      >
        <Layout>{children}</Layout>
      </RouteContext.Provider>
    )
  }
  // Note that on the client, window.route === ctxHydration

  const location = useLocation()
  const { pathname, search } = location
  const path = createPath({ pathname, search })

  if (window.route.firstRender) {
    // Indicates whether or not this is a first render on the client
    ctx.firstRender = true
    // If running on the client, the server context data
    // is still available, hydrated from window.route
    ctx.data = window.route.data
    ctx.head = window.route.head
    ctx.lastPath = path
  } else if (ctx.lastPath !== path) {
    ctx.firstRender = false
    ctx.data = undefined
    ctx.head = undefined
    ctx.onEnterExecuted = false
    ctx.lastPath = path
  }

  // When the next route renders client-side,
  // force it to execute all URMA hooks again
  useEffect(() => {
    window.route.firstRender = false
    window.route.actionData = {}
    ctx.lastPath = path
    return () => {
      ctx.lastPath = undefined
    }
  }, [ctx, path])

  // If we have a getData function registered for this route
  if (!ctx.firstRender && !ctx.data && ctx.getData) {
    try {
      // If not, fetch data from the JSON endpoint
      ctx.data = waitFetch(`/-/data${path}`)
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

  if (!ctx.firstRender && !ctx.head && ctx.getMeta) {
    const updateMeta = async () => {
      const { getMeta } = await ctx.loader()
      ctx.head = await getMeta(ctx)
      ctxHydration.useHead.push(ctx.head)
    }
    waitResource(path, 'updateMeta', updateMeta)
  }

  if (!ctx.firstRender && !ctx.onEnterExecuted && ctx.onEnter) {
    const runOnEnter = async () => {
      const { onEnter } = await ctx.loader()
      const updatedData = await onEnter(ctx)
      if (!ctx.data) {
        ctx.data = {}
      }
      Object.assign(ctx.data, updatedData)
      ctx.onEnterExecuted = true
    }
    waitResource(path, 'onEnter', runOnEnter)
  }

  const Layout = layouts[ctx.layout ?? 'default']

  return (
    <RouteContext.Provider
      value={{
        ...ctxHydration,
        ...ctx,
        state: isServer ? (ctxHydration.state ?? {}) : proxy(ctxHydration.state ?? {}),
      }}
    >
      <Layout>{children}</Layout>
    </RouteContext.Provider>
  )
}
