import { createRenderFunction } from 'fastify-vite-react/server'
import { createApp } from '../main'
import routes from '../routes'

console.log('routes', routes)

export default {
 routes,
 render: createRenderFunction(createApp),
}
