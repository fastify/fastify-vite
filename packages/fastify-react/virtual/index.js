import { createRoutes } from '@fastify/react/server'

export default {
  routes: createRoutes(import('$app/routes.js')),
  create: import('$app/create.jsx'),
  context: import('$app/context.js'),
}
