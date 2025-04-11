/* global $locales, $localeDomains, $localePrefix */

import { createRoutes } from '@fastify/vue/server'

export default {
  routes: createRoutes(import('$app/routes.js'), { locales: $locales, localeDomains: $localeDomains, localePrefix: $localePrefix }),
  create: import('$app/create.js'),
  context: import('$app/context.js'),
}
