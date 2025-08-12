import { createRoutes } from '@fastify/vue/server'

export default {
  routes: createRoutes(import('$app/routes.js')),
  create: import('$app/create.js'),
  context: import('$app/context.js'),
}
