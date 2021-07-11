import { loadRoutes } from 'fastify-vite-react/app'

const routes = loadRoutes(import.meta.globEager('./views/*.jsx'))

export default routes
