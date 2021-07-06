import { createRenderFunction } from 'fastify-vite-react/server'
import { createApp } from '../main'
import routes from '../routes'

export default {
  routes,
  render: createRenderFunction(createApp),
}
