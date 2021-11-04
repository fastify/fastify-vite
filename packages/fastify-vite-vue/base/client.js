import { createSSRApp } from 'vue'
import { createMemoryHistory, createRouter, createWebHistory } from 'vue-router'
import { createHead } from '@vueuse/head'

import base from '@app/client.vue'
import routes from '@app/routes.js'

export async function createApp (ctx) {
  const resolvedRoutes = await routes()
  const app = createSSRApp(base)
  const head = createHead()
  const history = import.meta.env.SSR
    ? createMemoryHistory()
    : createWebHistory()
  const router = createRouter({ history, routes: resolvedRoutes })
  app.use(router)
  app.use(head)
  return { ctx, app, head, router, routes: resolvedRoutes }
}
