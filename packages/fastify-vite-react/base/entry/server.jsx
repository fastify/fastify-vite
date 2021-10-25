import { createRenderFunction } from 'fastify-vite-react/server'
import { createApp } from '@app/client.jsx'
import routes from '@app/routes'

export default {
  routes,
  render: createRenderFunction(createApp),
}
