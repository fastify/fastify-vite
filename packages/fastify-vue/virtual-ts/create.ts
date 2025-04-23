import { createApp, createSSRApp, reactive, ref } from 'vue'
import { createRouter } from 'vue-router'
import {
  createHistory,
  serverRouteContext,
  routeLayout,
  createBeforeEachHandler,
} from '@fastify/vue/client'
import { createHead as createClientHead } from '@unhead/vue/client'
import { createHead as createServerHead } from '@unhead/vue/server'
import { createBeforeEachHandler as createServerBeforeEachHandler } from '@fastify/vue/server'

import * as root from '$app/root.vue'

export default async function create (ctx) {
  const { routes, ctxHydration } = ctx

  const instance = ctxHydration.clientOnly
    ? createApp(root.default)
    : createSSRApp(root.default)

  let scrollBehavior = null
  if (typeof root.scrollBehavior === "function") {
    scrollBehavior = root.scrollBehavior
  }

  const history = createHistory()
  const router = createRouter({ history, routes, scrollBehavior })
  const layoutRef = ref(ctxHydration.layout ?? 'default')

  const isServer = import.meta.env.SSR
  instance.config.globalProperties.$isServer = isServer

  const head = isServer ? createServerHead() : createClientHead()
  instance.use(head)
  ctxHydration.useHead = head

  instance.provide(routeLayout, layoutRef)
  if (!isServer && ctxHydration.state) {
    ctxHydration.state = reactive(ctxHydration.state)
  }

  if (isServer) {
    router.beforeEach(createServerBeforeEachHandler(ctx))
    instance.provide(serverRouteContext, ctxHydration)
  } else {
    router.beforeEach(createBeforeEachHandler(ctx, layoutRef))
  }

  instance.use(router)

  if (typeof root.configure === 'function') {
    await root.configure({ app: instance, router, head })
  }

  return { instance, ctx, state: ctxHydration.state, router }
}
