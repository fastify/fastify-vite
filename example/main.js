import { getCurrentInstance, ref, createSSRApp } from 'vue'
import base from './base.vue'

import { createHead } from '@vueuse/head'
import { getRouter } from './router'

const { assign } = Object

export function createApp (req) {
  const app = createSSRApp(base)
  const head = createHead()
  const ctx = { req } // this can be retrieved via useSSRContext()
  const router = getRouter()
  app.use(router)
  app.use(head)
  return { ctx, app, head, router }
}

export async function useSSRData (fetchOptions = {}) {
  const appConfig = getCurrentInstance().appContext.app.config
  const ssrDataPath = appConfig.globalProperties.$ssrDataPath()
  let ssrData = ref(appConfig.globalProperties.$ssrData)
  const ssrDataRefresh = async (overrideOptions = {}) => {
    const response = await fetch(ssrDataPath, assign(fetchOptions, overrideOptions))
    const { headers, status } = response
    const body = await response.json()
    return { headers, status, body }
  }
  if (!ssrData.value && !import.meta.env.SSR) {
    const { body } = await ssrDataRefresh()
    ssrData = ref(body)
  }
  return [ssrData, ssrDataRefresh, ssrDataPath]
}
