import { expect, test } from 'vitest'

import { main as cjsServer } from './fixtures/cjs/server.js'
import { main as esmServer } from './fixtures/esm/server.js'

test('esm - should register development server in development mode', async () => {
  const server = await esmServer(true)
  expect(server.vite.devServer).toBeDefined()
  await server.vite.devServer.close()
})

test.skip('esm - should not register development server in production mode', async () => {
  const server = await esmServer()
  expect(server.vite.devServer).toBeUndefined()
})

test('esm - should add Reply decorators', async () => {
  const server = await esmServer(true)
  server.get('/', (_, reply) => {
    expect(reply.html).toBeDefined()
    expect(reply.render).toBeDefined()
  })
  await server.vite.devServer.close()
})

test('cjs - should register development server in development mode', async () => {
  const server = await cjsServer(true)
  expect(server.vite.devServer).toBeDefined()
  await server.vite.devServer.close()
})

test.skip('cjs - should not register development server in production mode', async () => {
  const server = await cjsServer()
  expect(server.vite.devServer).toBeUndefined()
})

test('cjs - should add Reply decorators', async () => {
  const server = await cjsServer(true)
  server.get('/', (_, reply) => {
    expect(reply.html).toBeDefined()
    expect(reply.render).toBeDefined()
  })
  await server.vite.devServer.close()
})
