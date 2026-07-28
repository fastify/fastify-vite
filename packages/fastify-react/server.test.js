import test from 'node:test'
import assert from 'node:assert/strict'
import { createRoutes } from './server.js'

test('createRoutes converts every dynamic segment in a route path', async () => {
  const routes = await createRoutes(
    Promise.resolve({
      default: {
        '/pages/[level]/singular/[second]/third/[fourth].tsx': async () => ({
          default: () => null,
        }),
        '/pages/[level]/wildcard/[slug+].tsx': async () => ({
          default: () => null,
        }),
      },
    }),
  )

  assert.deepEqual(Array.from(routes, (route) => route.path).sort(), [
    '/:level/singular/:second/third/:fourth',
    '/:level/wildcard/*',
  ])
})
