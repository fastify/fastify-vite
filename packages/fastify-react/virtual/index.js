
// SSR entry point

import { memoize } from '@hiogawa/utils'
import { ok } from 'node:assert'
import { createRoutes } from '@fastify/react/server'

export default {
  routes: createRoutes(import('$app/routes.js')),
  create: import('$app/create.jsx'),
  context: import('$app/context.js'),
}

async function importClientReference(id) {
  if (import.meta.env.DEV) {
    return import(/* @vite-ignore */ id)
  } else {
    const clientReferences = await import('virtual:client-references')
    const dynImport = clientReferences.default[id]
    ok(dynImport, `client reference not found '${id}'`)
    return dynImport()
  }
}

// Unused, remove?
export function initClientReferences() {
  Object.assign(globalThis, {
    __webpack_require__: memoize(importClientReference)
  })
}

globalThis.__webpack_require__ = memoize(importClientReference)

