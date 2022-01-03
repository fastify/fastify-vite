import { getRoutes, hydrateRoutes } from 'fastify-vite-vue-classic/routing'

export default import.meta.env.SSR
  ? () => getRoutes(import.meta.globEager('/views/*.vue'))
  : () => getRoutes(hydrateRoutes(import.meta.glob('/views/*.vue')))
