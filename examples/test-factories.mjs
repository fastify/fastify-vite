import assert from 'node:assert'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { build } from 'vite'
import { execaCommand } from 'execa'

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
      root: join(cwd, 'client'),
      build: {
        outDir: 'dist/client',
        ssrManifest: true,
      }
    })
    await build({
      root: join(cwd, 'client'),
      build: {
        outDir: 'dist/server',
        ssr: './index.js',
      }
    })
  }
}

export function makeSPABuildTest () {
  return async () => {
    await build({
      build: {
        outDir: 'dist/client',
      }
    })
  }
}
