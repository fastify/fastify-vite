import Head from 'unihead/client'
import create from '/:create.js'
import routesPromise from '/:routes.js'
import * as context from '/:context.js'

mount('#root')

async function mount (target) {
  const ctxHydration = await extendContext(window.route, context)
  const head = new Head(window.route.head, window.document)
  const resolvedRoutes = await routesPromise
  const routeMap = Object.fromEntries(
    resolvedRoutes.map((route) => [route.path, route]),
  )
  const { instance, router } = await create({
    head,
    ctxHydration,
    routes: window.routes,
    routeMap,
  })
  await router.isReady()
  instance.mount(target)
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
