import { createRoutes } from '@fastify/vue/server'
export { createBeforeEachHandler as createClientBeforeEachHandler } from '@fastify/vue/client'

export const createServerBeforeEachHandler = null

export default {
  routes: createRoutes(import('$app/routes.js')),
  create: import('$app/create.js'),
  context: import('$app/context.js'),
}
