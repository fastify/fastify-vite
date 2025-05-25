import { createRoutes } from '@fastify/vue/server'
export { createBeforeEachHandler as createClientBeforeEachHandler } from '@fastify/vue/client'

export const createServerBeforeEachHandler = null

export default {
  routes: createRoutes(import('$app/routes.ts')),
  create: import('$app/create.ts'),
  context: import('$app/context.ts'),
}
