import test from 'node:test'
import assert from 'node:assert'
import { setTimeout } from 'node:timers/promises'
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { makeBuildTest } from '../test-factories.mjs'
import { main } from './server.js'

const cwd = import.meta.dirname

// This test reproduces issue #358:
// https://github.com/fastify/fastify-vite/issues/358
//
// When registering @fastify/vite with a prefix option,
// static assets should be served under that prefix.

test('prefix-support (issue #358)', async (t) => {
  await t.test('build production bundle', makeBuildTest({ cwd }))

  await t.test('static assets served at prefixed path', async () => {
    const server = await main(false) // production mode

    // Find an asset file from the build
    const assetsDir = join(cwd, 'dist/client/assets')
    const assets = await readdir(assetsDir)
    const jsAsset = assets.find((f) => f.endsWith('.js'))

    // Asset should be accessible at /app/assets/...
    const prefixedResponse = await server.inject({
      method: 'GET',
      url: `/app/assets/${jsAsset}`,
    })
    assert.strictEqual(
      prefixedResponse.statusCode,
      200,
      'Asset should be accessible at prefixed path /app/assets/*',
    )

    // Asset should NOT be accessible at /assets/... (without prefix)
    const unprefixedResponse = await server.inject({
      method: 'GET',
      url: `/assets/${jsAsset}`,
    })
    assert.strictEqual(
      unprefixedResponse.statusCode,
      404,
      'Asset should NOT be accessible at unprefixed path /assets/*',
    )

    await server.close()
  })

  await t.test('index page accessible at prefixed path', async () => {
    const server = await main(false) // production mode

    const response = await server.inject({
      method: 'GET',
      url: '/app',
    })
    assert.strictEqual(response.statusCode, 200)
    assert.ok(response.body.includes('Prefix Support Example'))

    await server.close()
  })

  await t.test('public files served at prefixed path', async () => {
    const server = await main(false) // production mode

    // Public file should be accessible at /app/test.txt
    const prefixedResponse = await server.inject({
      method: 'GET',
      url: '/app/test.txt',
    })
    assert.strictEqual(
      prefixedResponse.statusCode,
      200,
      'Public file should be accessible at prefixed path /app/test.txt',
    )

    // Public file should NOT be accessible at /test.txt (without prefix)
    const unprefixedResponse = await server.inject({
      method: 'GET',
      url: '/test.txt',
    })
    assert.strictEqual(
      unprefixedResponse.statusCode,
      404,
      'Public file should NOT be accessible at unprefixed path /test.txt',
    )

    await server.close()
  })

  // In dev mode, Vite's middleware serves static files directly,
  // so the prefix option doesn't affect static file routing.
  // This test verifies dev mode is unaffected by this issue.
  await t.test('render index page in dev mode', async () => {
    const server = await main(true) // dev mode
    const response = await server.inject({ method: 'GET', url: '/app' })
    assert.strictEqual(response.statusCode, 200)
    await setTimeout(3000)
    await server.close()
  })
})
