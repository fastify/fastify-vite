import { createRoutes } from '@fastify/react/server'

export default {
  routes: createRoutes(import('$app/routes.ts')),
  create: import('$app/create.tsx'),
  context: import('$app/context.ts'),
}
