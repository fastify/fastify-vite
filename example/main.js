import { getCurrentInstance, ref } from 'vue'
import base from './base.vue'
import { createSSRApp } from 'vue'
import { createRouter } from './router'

export function createApp (req) {
  const app = createSSRApp(base)
  const ctx = { req } // this can be retrieved via useSSRContext()
  const router = createRouter()
  app.use(router)
  return { ctx, app, router }
}

export function useSSRData () {
  const appConfig = getCurrentInstance().appContext.app.config
  const { $ssrData, $ssrDataPath } = appConfig.globalProperties
  return [ ref($ssrData), $ssrDataPath() ]
}
