import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { remove } from 'fs-extra'
import { afterEach, describe, expect, test } from 'vitest'
import { viteFastify } from './plugin'

describe('viteFastify', () => {
  const distDir = resolve(import.meta.dirname, 'dist')
  const configDistFile = resolve(distDir, 'vite.config.dist.json')

  afterEach(() => {
    remove(configDistFile)
  })

  test('saves vite config to dist only in production mode', async () => {
    const vitePlugin = viteFastify({ distDir })

    await vitePlugin.configResolved({
      isProduction: true,
      base: 'wahaha',
      root: 'walala',
      build: {
        assetsDir: 'wassets',
        outDir: 'wowout',
      },
    })

    expect(JSON.parse(await readFile(configDistFile, 'utf-8'))).toEqual({
      base: 'wahaha',
      root: 'walala',
      build: {
        assetsDir: 'wassets',
        outDir: 'wowout',
      },
    })
  })

  test('does not save anything if not production mode', async () => {
    const vitePlugin = viteFastify({ distDir })

    await vitePlugin.configResolved({
      isProduction: false,
      root: 'walala',
    })

    expect(existsSync(configDistFile)).toBe(false)
  })
})
