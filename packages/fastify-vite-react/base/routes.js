import { getRoutes } from 'fastify-vite/app'
import { hydrateRoutes } from 'fastify-vite-react/client'

export default import.meta.env.SSR
  ? getRoutes(import.meta.globEager('/views/*.jsx'))
  : getRoutes(await hydrateRoutes())
