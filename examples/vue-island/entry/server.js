import { routes, createApp } from '../client'
import { createRenderFunction } from 'fastify-vite-vue/server'

export default {
  routes,
  render: createRenderFunction(createApp),
}
