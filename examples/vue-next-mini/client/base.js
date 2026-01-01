import { createSSRApp } from 'vue'
import { createRouter, createMemoryHistory, createWebHistory } from 'vue-router'

import base from './base.vue'
import routes from './routes.js'
import { createPageManager } from './next.js'

export async function createApp(ctx, url) {
  const instance = createSSRApp(base)
  const history = import.meta.env.SSR ? createMemoryHistory() : createWebHistory()
  const router = createRouter({ history, routes })
  const pageManager = createPageManager({
    ctx,
    router,
    routes,
    ssr: import.meta.env.SSR,
  })
  instance.use(pageManager)
  instance.use(router)

  if (url) {
    router.push(url)
    await router.isReady()
  }

  return { ctx, router, instance }
}
