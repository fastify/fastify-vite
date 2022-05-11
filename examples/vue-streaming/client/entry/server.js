import { createApp } from './app'
import routes from './routes.js'

export default (createRenderFunction) => ({
  // Provides client-side navigation routes to fastify-vite
  // Individual server Fastify routes are registered for each client route
  routes,
  // Provides SSR function to fastify-vite
  render: createRenderFunction(createApp),
})
