import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { remove } from 'fs-extra'
import { afterEach, describe, expect, test } from 'vitest'
import { viteFastify } from './plugin'
import { CACHED_VITE_CONFIG_FILE_NAME, CACHE_DIR } from './sharedPaths'

describe('viteFastify', () => {
  const configDistFile = resolve(CACHE_DIR, CACHED_VITE_CONFIG_FILE_NAME)

  afterEach(async () => {
    await remove(configDistFile)
  })

  test('saves vite config to dist only in production mode', async () => {
    const vitePlugin = viteFastify()

    await vitePlugin.configResolved({
      configFile: import.meta.filename,
      isProduction: true,
    })

    await vitePlugin.writeBundle()
    expect(existsSync(configDistFile)).toBe(true)
  })

  test('does not save anything if not production mode', async () => {
    const vitePlugin = viteFastify()

    await vitePlugin.configResolved({
      configFile: import.meta.filename,
      isProduction: false,
      root: 'walala',
    })

    await vitePlugin.writeBundle()

    expect(existsSync(configDistFile)).toBe(false)
  })

  test('saves only the needed properties', async () => {
    const vitePlugin = viteFastify()

    await vitePlugin.configResolved({
      isProduction: true,
      base: 'wahaha',
      root: 'walala',
      build: {
        assetsDir: 'wassets',
        outDir: 'wowout',
      },
      unneededProperty: 'go away',
    })

    await vitePlugin.writeBundle()

    expect(JSON.parse(await readFile(configDistFile, 'utf-8'))).toEqual({
      base: 'wahaha',
      root: 'walala',
      build: {
        assetsDir: 'wassets',
      },
      fastify: {
        clientOutDir: 'wowout',
      },
    })
  })

  test('merges server and client configs for SSR builds', async () => {
    const vitePluginClient = viteFastify()
    const vitePluginServer = viteFastify()
    const viteConfig = {
      configFile: import.meta.filename,
      isProduction: true,
      base: 'wahaha',
      root: 'walala',
    }

    await vitePluginClient.configResolved({
      ...viteConfig,
      build: {
        assetsDir: 'wassets',
        outDir: 'wowout/client',
      },
    })
    await vitePluginClient.writeBundle()

    await vitePluginServer.configResolved({
      ...viteConfig,
      build: {
        assetsDir: 'wassets',
        outDir: 'wowout/server',
        ssr: true,
      },
    })
    await vitePluginServer.writeBundle()

    expect(JSON.parse(await readFile(configDistFile, 'utf-8'))).toEqual({
      base: 'wahaha',
      root: 'walala',
      build: {
        assetsDir: 'wassets',
      },
      fastify: {
        clientOutDir: 'wowout/client',
        ssrOutDir: 'wowout/server',
      },
    })
  })

  test('does not error if "configFile" is missing in dev mode', async () => {
    const vitePlugin = viteFastify()

    expect(() =>
      vitePlugin.configResolved({
        isProduction: false,
      }),
    ).not.toThrow()
  })
})
