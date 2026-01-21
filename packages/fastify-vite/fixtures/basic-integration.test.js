import { execSync } from 'node:child_process'
import { join } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'

import { main as cjsServer } from './cjs/server.cjs'
import { main as esmServer } from './esm/server.js'

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
