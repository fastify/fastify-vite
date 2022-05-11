import { createSSRApp, useSSRContext, reactive } from 'vue'
import { createRouter, createMemoryHistory, createWebHistory } from 'vue-router'
import App from './app.vue'
import routes from './routes.js'

const createHistory = import.meta.env.SSR
  ? createMemoryHistory
  : createWebHistory

export async function createApp (ctx, url) {
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
      window.routeState = undefined
    })
  }
  instance.use(router)
  if (url) {
    router.push(url)
    await router.isReady()
  }
  return { ctx, instance, router }
}

export function useRouteState (stateLoader) {
  if (import.meta.env.SSR) {
    return reactive({ ...useSSRContext(), loading: false })
  }
  const routeState = reactive({
    ...window.routeState,
    loading: !window.routeState,
    error: null,
  })
  if (!routeState.loading) {
    return routeState
  }
  stateLoader().then((updatedState) => {
    Object.assign(routeState, {
      ...updatedState,
      loading: false,
    })
  }).catch((error) => {
    Object.assign(routeState, {
      loading: false,
      error,
    })
  })
  return routeState
}
