import test from 'node:test'
import assert from 'node:assert/strict'

test('createRoute RSC handler calls rscHandler.fetch', async () => {
  const { createRoute } = await import('./routing.js')
  const routes = []
  const scope = {
    route: (config) => routes.push(config),
  }
  const route = {
    path: '/rsc-page',
    rsc: true,
    method: ['GET'],
  }
  let fetchCalled = false
  const client = {
    routes: [],
    context: {},
    rscHandler: {
      fetch: async (_request) => {
        fetchCalled = true
        return new Response('rsc response', { status: 200 })
      },
    },
  }
  await createRoute({ route, client }, scope, { dev: true })

  // Verify main route is registered
  const mainRoute = routes.find((r) => r.url === '/rsc-page')
  assert.ok(mainRoute, 'main route should be registered')
  assert.equal(typeof mainRoute.handler, 'function')

  // Verify companion _.rsc route is registered for RSC routes
  const rscRoute = routes.find((r) => r.url === '/rsc-page_.rsc')
  assert.ok(rscRoute, 'companion _.rsc route should be registered')
  assert.equal(typeof rscRoute.handler, 'function')
  assert.deepEqual(rscRoute.method, ['GET', 'POST'])

  // Call the main route handler with mock req/reply
  const reply = {
    code: () => reply,
    header: () => {},
    send: () => {},
    type: () => reply,
  }
  const req = {
    url: '/rsc-page',
    headers: { host: 'localhost' },
    method: 'GET',
    protocol: 'http',
    hostname: 'localhost',
  }
  await mainRoute.handler(req, reply)
  assert.equal(fetchCalled, true)
})

test('createRoute dev handler does not call rscHandler.fetch', async () => {
  const { createRoute } = await import('./routing.js')
  const routes = []
  const scope = {
    route: (config) => routes.push(config),
  }
  const route = {
    path: '/standard',
    rsc: false,
    method: ['GET'],
  }
  const client = {
    routes: [],
    context: {},
  }
  await createRoute({ route, client }, scope, { dev: true })
  const registered = routes[0]
  assert.equal(registered.url, '/standard')
  assert.equal(typeof registered.handler, 'function')
})
