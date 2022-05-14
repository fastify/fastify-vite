import { createSSRApp } from 'vue'
import { createRouter, createMemoryHistory, createWebHistory } from 'vue-router'

import base from './base.vue'
import routes from './routes.js'

export async function createApp (ctx, url) {
  const instance = createSSRApp(base)
  const history = import.meta.env.SSR ? createMemoryHistory() : createWebHistory()
  const router = createRouter({ history, routes })

  instance.use(router)

  if (url) {
    router.push(url)
    await router.isReady()
  }

  return { ctx, router, instance }
}
