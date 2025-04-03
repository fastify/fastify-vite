import { createApp as createSPAApp } from 'vue'
import base from './base.vue'

export function createApp () {
  return createSPAApp(base)
}
