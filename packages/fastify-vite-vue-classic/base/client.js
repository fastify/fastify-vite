import Vue from 'vue'
import Router from 'vue-router'
import Meta from 'vue-meta'

import { createBeforeEachHandler } from 'fastify-vite-vue-classic/routing'
import { hydrationDone } from 'fastify-vite-vue-classic/app'

import baseLayout from '@app/client.vue'
import loadRoutes from '@app/routes.js'

Vue.use(Meta, {
  keyName: 'head',
})
Vue.use(Router)

export async function createApp (ctx) {
  const resolvedRoutes = await loadRoutes()
  const router = new Router({
    mode: 'history',
    routes: resolvedRoutes,
  })
  const app = new Vue({
    router,
    render: h => h('baseLayout'),
    components: { baseLayout },
  })
  if (!import.meta.env.SSR) {
    router.beforeEach(createBeforeEachHandler(resolvedRoutes))
    let hydrated = false
    router.afterEach(() => {
      if (!hydrated) {
        hydrationDone()
        hydrated = true
      }
    })
  }
  ctx.meta = app.$meta()
  return { ctx, app, router, routes: resolvedRoutes }
}
