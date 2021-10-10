import { loadViews } from 'fastify-vite-vue/app'

export default loadViews(import.meta.glob('./*.vue'))
