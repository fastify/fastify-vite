import { createApp, createSSRApp, reactive, ref } from 'vue'
import { createRouter } from 'vue-router'
import {
  isServer,
  createHistory,
  serverRouteContext,
  routeLayout,
  createBeforeEachHandler,
} from '/dx:core.js'
import * as root from '/dx:root.vue'

export default async function create (ctx) {
  const { routes, ctxHydration } = ctx

  const instance = ctxHydration.clientOnly
    ? createApp(root.default)
    : createSSRApp(root.default)

  const history = createHistory()
  const router = createRouter({ history, routes })
  const layoutRef = ref(ctxHydration.layout ?? 'default')

  instance.config.globalProperties.$isServer = isServer
  
  instance.provide(routeLayout, layoutRef)
  if (!isServer) {
    ctxHydration.state = reactive(ctxHydration.state)
  }

  if (isServer) {
    instance.provide(serverRouteContext, ctxHydration)
  } else {
    router.beforeEach(createBeforeEachHandler(ctx, layoutRef))
  }

  instance.use(router)

  if (root.configure) {
    await root.configure(instance)
  }

  if (ctx.url) {
    router.push(ctx.url)
    await router.isReady()
  }

  return { instance, ctx, router }
}
