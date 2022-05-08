import { createSSRApp, useSSRContext } from 'vue'
import { createRouter, createMemoryHistory, createWebHistory } from 'vue-router'
import App from './app.vue'
import routes from './routes.js'

const createHistory = import.meta.env.SSR
  ? createMemoryHistory
  : createWebHistory

export default async function createApp (ctx) {
  const instance = createSSRApp(App)
  const router = createRouter({
    history: createHistory(),
    routes,
  })
  if (!import.meta.env.SSR) {
    let firstRender = true
    router.afterEach(() => {
      if (firstRender) {
        firstRender = false
        return
      }
      window.hydration = undefined
    })
  }
  instance.use(router)
  return { ctx, instance, router }
}

export async function useRouteData (hydrator) {
  if (import.meta.env.SSR) {
    return useSSRContext().data
  }
  return window.hydration ?? await hydrator()
}
