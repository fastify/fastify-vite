import { createSSRApp } from 'vue'
import base from './base.vue'

export function createApp () {
  return createSSRApp(base)
}
