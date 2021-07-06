import { loadRoutes } from 'fastify-vite-react/app'

const routes = loadRoutes(import.meta.globEager('./views/*.jsx'))

console.log('routes', routes)

export default routes
