import { createApp, createSSRApp, reactive, ref } from 'vue'
import { createRouter } from 'vue-router'
import {
  createHistory,
  serverRouteContext,
  routeLayout,
  createBeforeEachHandler,
} from '@fastify/vue/client'

import * as root from '/:root.vue'

export default async function create (ctx) {
  const { routes, ctxHydration } = ctx

  const instance = ctxHydration.clientOnly
    ? createApp(root.default)
    : createSSRApp(root.default)

  const history = createHistory()
  const router = createRouter({ history, routes })
  const layoutRef = ref(ctxHydration.layout ?? 'default')

  const isServer = import.meta.env.SSR
  instance.config.globalProperties.$isServer = isServer

  instance.provide(routeLayout, layoutRef)
  if (!isServer && ctxHydration.state) {
    ctxHydration.state = reactive(ctxHydration.state)
  }

  if (isServer) {
    instance.provide(serverRouteContext, ctxHydration)
  } else {
    router.beforeEach(createBeforeEachHandler(ctx, layoutRef))
  }

  instance.use(router)

  if (typeof root.configure === 'function') {
    await root.configure({ app: instance, router })
  }

  return { instance, ctx, state: ctxHydration.state, router }
}
