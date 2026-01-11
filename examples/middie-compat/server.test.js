import test from 'node:test'
import assert from 'node:assert'
import { mainMiddieFirst, mainViteFirst } from './server.js'

// This test reproduces issue #259:
// https://github.com/fastify/fastify-vite/issues/259
//
// Users should be able to use @fastify/middie with @fastify/vite

test('middie-compat (issue #259)', async (t) => {
  await t.test('scenario 1: register middie before fastify-vite', async () => {
    const server = await mainMiddieFirst(true)

    // Test that the server starts
    const indexResponse = await server.inject({ method: 'GET', url: '/' })
    assert.strictEqual(indexResponse.statusCode, 200)

    // Test that custom middleware works
    const middlewareResponse = await server.inject({ method: 'GET', url: '/middleware-test' })
    assert.strictEqual(middlewareResponse.statusCode, 200)
    const body = JSON.parse(middlewareResponse.body)
    assert.strictEqual(body.customMiddleware, true, 'Custom middleware should have run')

    await server.close()
  })

  await t.test('scenario 2: use server.use() after fastify-vite ready', async () => {
    const server = await mainViteFirst(true)

    // Test that the server starts
    const indexResponse = await server.inject({ method: 'GET', url: '/' })
    assert.strictEqual(indexResponse.statusCode, 200)

    // Test that custom middleware works
    const middlewareResponse = await server.inject({ method: 'GET', url: '/middleware-test' })
    assert.strictEqual(middlewareResponse.statusCode, 200)
    const body = JSON.parse(middlewareResponse.body)
    assert.strictEqual(body.customMiddleware, true, 'Custom middleware should have run')

    await server.close()
  })
})
