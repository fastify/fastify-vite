import { setTimeout } from 'node:timers/promises'
import assert from 'node:assert'
import { join } from 'path'
import { loadConfigFromFile, createBuilder, build } from 'vite'

export function makeIndexTest({ main, dev }) {
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

export function makeSPABuildTest({ cwd }) {
  return async () => {
    const configFile = join(cwd, 'vite.config.js')
    const config = await loadConfigFromFile(
      {
        command: 'build',
        mode: 'production',
      },
      configFile,
    )
    await build(config)
  }
}

export function makeBuildTest({ cwd }) {
  return async () => {
    const configFile = join(cwd, 'vite.config.js')
    // const config = await loadConfigFromFile({
    //   command: 'build',
    //   mode: 'production'
    // }, configFile)
    const builder = await createBuilder({ configFile })
    await builder.buildApp()
  }
}

/**
 * This test verifies the server can start when cwd is different from the project directory:
 * https://github.com/fastify/fastify-vite/issues/298
 */
export function makeStartFromOutsideTest({ main }) {
  return async () => {
    const originalCwd = process.cwd()
    try {
      process.chdir(join(import.meta.dirname, '..'))
      const server = await main()
      const response = await server.inject({ method: 'GET', url: '/' })
      assert.strictEqual(response.statusCode, 200)
      await server.close()
    } finally {
      process.chdir(originalCwd)
    }
  }
}
