import { getRoutes } from 'fastify-vite/app'
import { hydrateRoutes } from 'fastify-vite-solid/client.mjs'

export default import.meta.env.SSR
  ? () => getRoutes(import.meta.globEager('/views/*.jsx'))
  : () => getRoutes(hydrateRoutes(import.meta.glob('/views/*.jsx')))
