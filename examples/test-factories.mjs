import assert from 'node:assert'
import { join } from 'node:path'
import { build } from 'vite'

export function makeIndexTest ({ main, dev }) {
  return async () => {
    const server = await main(dev)
    const response = await server.inject({ method: 'GET', url: '/' })
    assert.strictEqual(response.statusCode, 200)
    await server.vite.devServer?.close()
   }
}

export function makeSSRBuildTest ({ cwd }) {
  return async () => {
    await build({
      configFile: join(cwd, 'vite.config.js'),
      build: {
        outDir: 'dist/client',
        ssrManifest: true,
      }
    })
    await build({
      configFile: join(cwd, 'vite.config.js'),
      build: {
        outDir: 'dist/server',
        ssr: './index.js',
      }
    })
  }
}

export function makeSPABuildTest ({ cwd }) {
  return async () => {
    await build({
      configFile: join(cwd, 'vite.config.js'),
      build: {
        outDir: 'dist/client',
      }
    })
  }
}
