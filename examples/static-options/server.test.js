import test from 'node:test'
import assert from 'node:assert'
import { setTimeout } from 'node:timers/promises'
import { makeBuildTest } from '../test-factories.mjs'
import { main } from './server.js'

const cwd = import.meta.dirname

test('fastifyStaticOptions', async (t) => {
  await t.test('build production bundle', makeBuildTest({ cwd }))

  await t.test('setHeaders applies custom header in production mode', async () => {
    const server = await main(false) // production mode
    const response = await server.inject({ method: 'GET', url: '/test.txt' })
    assert.strictEqual(response.statusCode, 200)
    assert.strictEqual(response.headers['x-custom-header'], 'from-static-options')
    await server.close()
  })

  await t.test('preCompressed serves .gz file in production mode', async () => {
    const server = await main(false) // production mode
    const response = await server.inject({
      method: 'GET',
      url: '/test.txt',
      headers: { 'accept-encoding': 'gzip' },
    })
    assert.strictEqual(response.statusCode, 200)
    assert.strictEqual(response.headers['content-encoding'], 'gzip')
    await server.close()
  })

  await t.test('setHeaders does not apply in development mode', async () => {
    const server = await main(true) // dev mode
    const response = await server.inject({ method: 'GET', url: '/test.txt' })
    assert.strictEqual(response.statusCode, 200)
    assert.strictEqual(response.headers['x-custom-header'], undefined)
    await setTimeout(3000)
    await server.close()
  })

  await t.test('preCompressed does not apply in development mode', async () => {
    const server = await main(true) // dev mode
    const response = await server.inject({
      method: 'GET',
      url: '/test.txt',
      headers: { 'accept-encoding': 'gzip' },
    })
    assert.strictEqual(response.statusCode, 200)
    assert.strictEqual(response.headers['content-encoding'], undefined)
    await setTimeout(3000)
    await server.close()
  })
})
