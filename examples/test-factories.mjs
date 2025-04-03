import { setTimeout } from 'node:timers/promises'
import assert from 'node:assert'
import { join } from 'path'
import { loadConfigFromFile, createBuilder } from 'vite'

export function makeIndexTest ({ main, dev }) {
  return async () => {
    const server = await main(dev)
    const response = await server.inject({ method: 'GET', url: '/' })
    assert.strictEqual(response.statusCode, 200)
    process.nextTick(() => server.close())
  }
}

export function makeBuildTest ({ cwd }) {
  return async () => {
    const configFile = join(cwd, 'vite.config.js')
    const config = await loadConfigFromFile({ 
      command: 'build', 
      mode: 'production'
    }, configFile)
    const builder = await createBuilder(config)
    await builder.buildApp()
  }
}
