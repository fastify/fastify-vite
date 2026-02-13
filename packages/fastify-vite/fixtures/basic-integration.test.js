import { execSync } from 'node:child_process'
import { join } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'

import { main as cjsServer } from './cjs/server.cjs'
import { main as esmServer } from './esm/server.js'

const staticOpts = {
  fastifyStaticOptions: {
    preCompressed: true,
    setHeaders(res) {
      res.setHeader('X-Test-Static', '1')
    },
  },
}

describe('esm', () => {
  beforeAll(() => {
    execSync('pnpm build', { cwd: join(import.meta.dirname, 'esm'), stdio: 'inherit' })
  })

  it('should register development server in development mode', async () => {
    const server = await esmServer(true)
    expect(server.vite.devServer).toBeDefined()
    await server.vite.devServer.close()
  })

  it('should not register development server in production mode', async () => {
    const server = await esmServer(false)
    expect(server.vite.devServer).toBeUndefined()
  })

  it('should add Reply decorators', async () => {
    const server = await esmServer(true)
    server.get('/', (_, reply) => {
      expect(reply.html).toBeDefined()
      expect(reply.render).toBeDefined()
    })
    await server.vite.devServer.close()
  })

  it('should apply setHeaders from fastifyStaticOptions in production mode', async () => {
    const server = await esmServer(false, staticOpts)
    const response = await server.inject({ method: 'GET', url: '/test.txt' })
    expect(response.statusCode).toBe(200)
    expect(response.headers['x-test-static']).toBe('1')
  })

  it('should serve pre-compressed files in production mode', async () => {
    const server = await esmServer(false, staticOpts)
    const response = await server.inject({
      method: 'GET',
      url: '/test.txt',
      headers: { 'accept-encoding': 'gzip' },
    })
    expect(response.statusCode).toBe(200)
    expect(response.headers['content-encoding']).toBe('gzip')
  })

  it('should not apply setHeaders in development mode', async () => {
    const server = await esmServer(true, staticOpts)
    const response = await server.inject({ method: 'GET', url: '/test.txt' })
    expect(response.statusCode).toBe(200)
    expect(response.headers['x-test-static']).toBeUndefined()
    await server.vite.devServer.close()
  })

  it('should not serve pre-compressed files in development mode', async () => {
    const server = await esmServer(true, staticOpts)
    const response = await server.inject({
      method: 'GET',
      url: '/test.txt',
      headers: { 'accept-encoding': 'gzip' },
    })
    expect(response.statusCode).toBe(200)
    expect(response.headers['content-encoding']).toBeUndefined()
    await server.vite.devServer.close()
  })
})

describe('cjs', () => {
  beforeAll(() => {
    execSync('pnpm build', { cwd: join(import.meta.dirname, 'cjs'), stdio: 'inherit' })
  })

  it('should register development server in development mode', async () => {
    const server = await cjsServer(true)
    expect(server.vite.devServer).toBeDefined()
    await server.vite.devServer.close()
  })

  it('should not register development server in production mode', async () => {
    const server = await cjsServer(false)
    expect(server.vite.devServer).toBeUndefined()
  })

  it('should add Reply decorators', async () => {
    const server = await cjsServer(true)
    server.get('/', (_, reply) => {
      expect(reply.html).toBeDefined()
      expect(reply.render).toBeDefined()
    })
    await server.vite.devServer.close()
  })
})
