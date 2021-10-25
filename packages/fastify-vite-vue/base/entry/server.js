import { createApp } from '@app/client.js'
import { createRenderFunction } from 'fastify-vite-vue/server'
import routes from '@app/routes.js'

export default {
  routes,
  render: createRenderFunction(createApp),
}
