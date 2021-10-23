import { createApp } from '/client.js'
import { createRenderFunction } from 'fastify-vite-vue/server'
import routes from '@fastify-vite-vue/routes'

export default {
  routes,
  render: createRenderFunction(createApp),
}
