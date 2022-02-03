import { createRenderFunction } from 'fastify-vite-solid/server'
import { createApp } from '@app/client.jsx'
import routes from '@app/routes.js'

export default {
  routes,
  render: createRenderFunction(createApp),
}
