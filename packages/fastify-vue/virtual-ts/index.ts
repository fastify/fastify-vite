/* global $locales, $localeDomains, $localePrefix */

import { createRoutes } from '@fastify/vue/server'

export default {
  routes: createRoutes(import('$app/routes.ts'), { locales: $locales, localeDomains: $localeDomains, localePrefix: $localePrefix }),
  create: import('$app/create.ts'),
  context: import('$app/context.ts'),
}
