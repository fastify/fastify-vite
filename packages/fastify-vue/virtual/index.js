/* global $defaultLocale, $localeDomains, $localePrefix */

import { createRoutes } from '@fastify/vue/server'

export default {
  routes: createRoutes(import('$app/routes.js'), { defaultLocale: $defaultLocale, localeDomains: $localeDomains, localePrefix: $localePrefix }),
  create: import('$app/create.js'),
  context: import('$app/context.js'),
}
