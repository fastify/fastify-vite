import { loadRoutes } from 'fastify-vite-vue/app'

export default loadRoutes(import.meta.globEager('/views/*.vue'))
