import { createSSRApp } from 'vue'
import base from './base.vue'

export type App = ReturnType<typeof createSSRApp>
export function createApp(): App {
  return createSSRApp(base)
}
