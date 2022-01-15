import { createApp } from '@app/client.js'
import { createRenderFunction } from 'fastify-vite-vue-classic/server'
import routes from '@app/routes.js'

export default {
  routes,
  render: createRenderFunction(createApp),
}
