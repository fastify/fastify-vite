import { getRoutes } from 'fastify-vite/app'
import { hydrateRoutes } from 'fastify-vite-vue/client.mjs'

export default import.meta.env.SSR
  ? () => getRoutes(import.meta.globEager('/views/*.vue'))
  : () => getRoutes(hydrateRoutes(import.meta.glob('/views/*.vue')))
