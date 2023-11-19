import Head from 'unihead/client'
import { createRoot, hydrateRoot } from 'react-dom/client'

import create from '/dx:create.tsx'
import routesPromise from '/dx:routes.js'

mount('main')

async function mount (target) {
  if (typeof target === 'string') {
    target = document.querySelector(target)
  }
  const context = await import('/dx:context.ts')
  const ctxHydration = await extendContext(window.route, context)
  const head = new Head(window.route.head, window.document)
  const resolvedRoutes = await routesPromise
  const routeMap = Object.fromEntries(
    resolvedRoutes.map((route) => [route.path, route]),
  )

  const app = create({
    head,
    ctxHydration,
    routes: window.routes,
    routeMap,
  })
  if (ctxHydration.clientOnly) {
    createRoot(target).render(app)
  } else {
    hydrateRoot(target, app)
  }
}

async function extendContext (ctx, {
  // The route context initialization function
  default: setter,
  // We destructure state here just to discard it from extra
  state,
  // Other named exports from context.js
  ...extra
}) {
  Object.assign(ctx, extra)
  if (setter) {
    await setter(ctx)
  }
  return ctx
}
