import { createApp } from '@app/client'
import { createRenderFunction } from 'fastify-vite-vue/server'
import routes from '@app/routes'

export default {
  routes,
  render: createRenderFunction(createApp),
}
