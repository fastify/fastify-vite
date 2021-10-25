import { loadRoutes } from 'fastify-vite-react/app'

export default loadRoutes(import.meta.globEager('/views/*.jsx'))
