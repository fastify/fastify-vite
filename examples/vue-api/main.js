import { createSSRApp } from 'vue'
import base from './base.vue'

import { createHead } from '@vueuse/head'
import { getRouter } from './router'

export function createApp (ctx) {
  const app = createSSRApp(base)
  const head = createHead()
  const router = getRouter()
  app.use(router)
  app.use(head)
  return { ctx, app, head, router }
}
