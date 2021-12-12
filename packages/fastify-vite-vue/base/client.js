import { createSSRApp } from 'vue'
import { createMemoryHistory, createRouter, createWebHistory } from 'vue-router'
import { createHead } from '@vueuse/head'
import { useIsomorphic, appState } from 'fastify-vite-vue/app'
import { kFirstRender } from 'fastify-vite-vue/symbols'

import base from '@app/client.vue'
import routes from '@app/routes.js'

export async function createApp (ctx) {
  const resolvedRoutes = await routes()
  const resolvedRoutesMap = makeRouteMap(resolvedRoutes)
  const app = createSSRApp(base)
  const head = createHead()
  const history = import.meta.env.SSR
    ? createMemoryHistory()
    : createWebHistory()
  const router = createRouter({ history, routes: resolvedRoutes })
  if (!import.meta.env.SSR) {
    router.beforeEach(async (to) => {
      const ctx = useIsomorphic()
      const { hasPayload, hasData } = resolvedRoutesMap[to.path]
      if (!!window[kStaticPayload] && hasPayload) {
        try {
          const response = await window.fetch(getPayloadPath(to))          
          ctx.$payload = await response.json()
        } catch (error) {
          console.error(error)          
          ctx.$error = error
        }        
      } else if (!appState[kFirstRender] && (hasPayload || hasData)) {
        if (hasPayload) {
          try {
            const response = await window.fetch(getPayloadPath(to))          
            ctx.$payload = await response.json()
          } catch (error) {
            console.error(error)
            ctx.$error = error
          }
        }
        if (hasData) {
          const { getData } = await resolvedRoutesMap[to.path].component()
          try {
            ctx.$data = await getData(ctx)
          } catch (error) {
            console.error(error)
            ctx.$error = error
          }          
        }
      }
    })
  }
  app.use(router)
  app.use(head)
  return { ctx, app, head, router, routes: resolvedRoutes }
}

function makeRouteMap (resolvedRoutes) {
  const map = {}
  for (const route of resolvedRoutes) {
    map[route.path] = route
  }
  return map
}

const kStaticPayload = Symbol.for('kStaticPayload')

function getPayloadPath (route) {
  if (!!window[kStaticPayload]) {
    let { pathname } = Object.assign({}, document.location)
    if (pathname.endsWith('/')) {
      pathname = `${pathname}index`
    }
    return `${pathname.replace('.html', '')}/index.json`
  } else {
    return `/-/payload${route.path}`
  }
}
