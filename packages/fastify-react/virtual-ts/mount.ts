import { createRoot, hydrateRoot } from 'react-dom/client'
import { hydrateRoutes } from '@fastify/react/client'
import { createHead } from '@unhead/react/client'
import routes from '$app/routes.js'
import create from '$app/create.jsx'
import * as context from '$app/context.js'

async function mountApp (...targets) {
  const ctxHydration = await extendContext(window.route, context)
  const resolvedRoutes = await hydrateRoutes(routes)
  const routeMap = Object.fromEntries(
    resolvedRoutes.map((route) => [route.path, route]),
  )
  const useHead = createHead()
  ctxHydration.useHead = useHead
  ctxHydration.useHead.push(window.route.head)

  const app = create({
    ctxHydration,
    routes: window.routes,
    routeMap,
  })


  let mountTargetFound = false
  for (const target of targets) {
    const targetElem = document.querySelector(target)
    if (targetElem) {
      mountTargetFound = true
      if (ctxHydration.clientOnly) {
        createRoot(targetElem).render(app)
      } else {
        hydrateRoot(targetElem, app)
      }
      break
    }
  }
  if (!mountTargetFound) {
    throw new Error(`No mount element found from provided list of targets: ${targets}`)
  }
}

mountApp('#root', 'main')

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
