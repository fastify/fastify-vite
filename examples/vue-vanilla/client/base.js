import { createSSRApp } from 'vue'
import { 
  createRouter, 
  createMemoryHistory, 
  createWebHistory 
} from 'vue-router'

import base from './base.vue'
import routes from './routes.js'
import createState from './state.js'

export async function createApp (ctx, url) {
  const instance = createSSRApp(base)
  const history = import.meta.env.SSR
    ? createMemoryHistory()
    : createWebHistory()
  const router = createRouter({ history, routes })

  // Populate todoList state with SSR context data
  // or client-side hydrated SSR context data
  const state = createState(ctx.data)
  instance.provide('state', state)

  instance.use(router)

  if (url) {
    router.push(url)
    await router.isReady()
  }

  return { ctx, router, instance }
}
