import { createRoutes } from '@fastify/vue/server'

export default {
  routes: createRoutes(import('$app/routes.ts')),
  create: import('$app/create.ts'),
  context: import('$app/context.ts'),
}
