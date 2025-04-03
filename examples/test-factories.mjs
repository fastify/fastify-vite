import { setTimeout } from 'node:timers/promises'
import assert from 'node:assert'
import { join } from 'path'
import { loadConfigFromFile, createBuilder, build } from 'vite'

export function makeIndexTest ({ main, dev }) {
  return async () => {
    const server = await main(dev)
    const response = await server.inject({ method: 'GET', url: '/' })
    assert.strictEqual(response.statusCode, 200)
    await setTimeout(3000)
    await server.close()
  }
}


// export function makeBuildTest () {
//   return async () => {
//     const builder = await createBuilder()
//     await builder.buildApp()
//   }
// }


export function makeSPABuildTest ({ cwd }) {
  return async () => {
    const configFile = join(cwd, 'vite.config.js')
    const config = await loadConfigFromFile({ 
      command: 'build', 
      mode: 'production'
    }, configFile)
    await build(config)
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
