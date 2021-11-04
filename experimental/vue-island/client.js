import { createSSRApp } from 'vue'
import { getViewRoutes } from 'fastify-vite/app'

import * as client from './client.vue'

export const routes = getViewRoutes(client)

export function createApp (ctx) {
  return { ctx, app: createSSRApp(client.default) }
}
