import { hydrateRoutes } from '@fastify/vue/client'
import routes from '$app/routes.ts'
import create from '$app/create.ts'
import * as context from '$app/context.ts'
import * as root from '$app/root.vue'

async function mountApp (...targets) {
  const ctxHydration = await extendContext(window.route, context)
  const resolvedRoutes = await hydrateRoutes(routes)
  const routeMap = Object.fromEntries(
    resolvedRoutes.map((route) => [route.path, route]),
  )
  const { instance, router } = await create({
    ctxHydration,
    routes: window.routes,
    routeMap,
  })
  await router.isReady()
  let mountTargetFound = false
  for (const target of targets) {
    if (document.querySelector(target)) {
      mountTargetFound = true
      instance.mount(target)
      break
    }
  }
  if (!mountTargetFound) {
    throw new Error(`No mount element found from provided list of targets: ${targets}`)
  }
}

const mountMethod = 'mount'

if (mountMethod in root) {
  mountApp(root[mountMethod])
} else {
  mountApp('#root', 'main')
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
