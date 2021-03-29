import { createSSRApp } from 'vue'
import App from './base.jsx'

import { getRouter } from './router'

export function createApp(req) {
  const app = createSSRApp(App)
  const ctx = { req } // this can be retrieved via useSSRContext()
  return { ctx, app }
}
