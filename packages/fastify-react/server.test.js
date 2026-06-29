import test from 'node:test'
import assert from 'node:assert/strict'

test('getRouteModuleExports extracts rsc: true from route module', async () => {
  const { getRouteModuleExports } = await import('./server.js')
  const result = getRouteModuleExports({
    default: () => null,
    rsc: true,
  })
  assert.equal(result.rsc, true)
})

test('getRouteModuleExports returns rsc: false when not set', async () => {
  const { getRouteModuleExports } = await import('./server.js')
  const result = getRouteModuleExports({
    default: () => null,
  })
  assert.equal(result.rsc, false)
})

test('getRouteModuleExports returns rsc: false when explicitly false', async () => {
  const { getRouteModuleExports } = await import('./server.js')
  const result = getRouteModuleExports({
    default: () => null,
    rsc: false,
  })
  assert.equal(result.rsc, false)
})
