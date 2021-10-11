import { createSSRApp } from 'vue'
import { createMemoryHistory, createRouter, createWebHistory } from 'vue-router'
import { createHead } from '@vueuse/head'
import { loadViews } from 'fastify-vite/app'

import base from './base.vue'

export const views = loadViews(import.meta.globEager('./views/*.vue'))

export function createApp (ctx) {
  const app = createSSRApp(base)
  const head = createHead()
  const history = import.meta.env.SSR
    ? createMemoryHistory()
    : createWebHistory()
  const router = createRouter({ history, routes: views.routes })
  app.use(router)
  app.use(head)
  return { ctx, app, head, router }
}

export function createIsland (ctx, { id, component }) {
  return {
    ctx,
    component,
    island: id,
    get app () {
      return createSSRApp(component)
    },
  }
}
