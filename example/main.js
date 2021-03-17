import { createSSRApp } from 'vue'
import base from './base.vue'

import { createHead } from '@vueuse/head'
import { getRouter } from './router'

export function createApp (req) {
  const app = createSSRApp(base)
  const head = createHead()
  const ctx = { req } // this can be retrieved via useSSRContext()
  const router = getRouter()
  app.use(router)
  app.use(head)
  return { ctx, app, head, router }
}
