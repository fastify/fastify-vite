import assert from 'node:assert'
import { join } from 'node:path'
import { build } from 'vite'

export function makeIndexTest ({ main, dev }) {
  return async () => {
    const server = await main(dev)
    const response = await server.inject({ method: 'GET', url: '/' })
    assert.strictEqual(response.statusCode, 200)
    process.nextTick(() => server.close())
   }
}

export function makeSSRBuildTest ({ cwd }) {
  return async () => {
    const configFile = join(cwd, 'vite.config.js')
    await build({ configFile, mode: 'production' })
  }
}

export function makeSPABuildTest ({ cwd }) {
  return async () => {
    const configFile = join(cwd, 'vite.config.js')
    await build({ configFile, mode: 'production' })
  }
}
