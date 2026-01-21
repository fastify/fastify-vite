import { existsSync, lstatSync, readdirSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { dirname, isAbsolute, join } from 'node:path'
import type { ConfigEnv, UserConfigExport } from 'vite'
import { getApplicationRootDir } from './paths.ts'
import type { ExtendedUserConfig, ExtendedResolvedViteConfig } from '../types/vite-configs.ts'

/** Function that returns an extended user config, matching Vite's UserConfigFn signature */
type ExtendedUserConfigFn = (env: ConfigEnv) => ExtendedUserConfig | Promise<ExtendedUserConfig>

/** Module shape when importing a vite.config file - handles both direct and default exports */
type UserConfigModule =
  | UserConfigExport
  | ExtendedUserConfig
  | ExtendedUserConfigFn
  | {
      default: UserConfigExport | ExtendedUserConfig | ExtendedUserConfigFn
    }

function findViteConfigJson(appRoot: string, folderNames: string[] = ['dist', 'build']) {
  for (const folderName of folderNames) {
    const folder = join(appRoot, folderName)

    // Check folder/vite.config.json
    let configPath = join(folder, 'vite.config.json')
    if (existsSync(configPath)) {
      return configPath
    }

    // Check one level deeper (e.g., dist/client/vite.config.json)
    try {
      for (const entry of readdirSync(folder)) {
        const entryPath = join(folder, entry)
        if (lstatSync(entryPath).isDirectory()) {
          configPath = join(entryPath, 'vite.config.json')
          if (existsSync(configPath)) {
            return configPath
          }
        }
      }
    } catch {
      // Directory doesn't exist or can't be read
    }

    // Check client/folder/ - common pattern for projects with nested client folder
    configPath = join(appRoot, 'client', folderName, 'vite.config.json')
    if (existsSync(configPath)) {
      return configPath
    }
  }

  return null
}

function findConfigFile(root: string) {
  for (const ext of ['js', 'mjs', 'ts']) {
    const configFile = join(root, `vite.config.${ext}`)
    if (existsSync(configFile)) {
      return configFile
    }
  }
}

async function resolveViteConfig(
  root: string,
  dev: boolean,
  {
    spa,
    distDir,
  }: {
    spa?: boolean
    distDir?: string
  } = {},
) {
  const command = 'build'
  const mode = dev ? 'development' : 'production'
  if (!dev) {
    const appRoot = await getApplicationRootDir(root)
    let viteConfigDistFile: string
    if (distDir) {
      if (isAbsolute(distDir)) {
        viteConfigDistFile = join(dirname(distDir), 'vite.config.json')
      } else {
        viteConfigDistFile = findViteConfigJson(appRoot, [distDir])
      }
    } else {
      // Auto-detect from standard locations relative to app root
      viteConfigDistFile = findViteConfigJson(appRoot)
    }
    if (viteConfigDistFile) {
      return [JSON.parse(await readFile(viteConfigDistFile, 'utf-8')), dirname(viteConfigDistFile)]
    }
    const searchedIn = distDir || `${appRoot}/{dist,build}`
    console.warn(`Failed to load cached Vite configuration. Searched in: ${searchedIn}`)
    process.exit(1)
  }

  let configFile = findConfigFile(root)
  if (!configFile) {
    return [null, null]
  }
  const { resolveConfig } = await import('vite')
  const resolvedConfig = (await resolveConfig(
    {
      configFile,
    },
    command,
    mode,
  )) as ExtendedResolvedViteConfig
  if (process.platform === 'win32') {
    configFile = `file://${configFile}`
  }
  let userConfig = (await import(configFile).then((m) => m.default)) as UserConfigModule
  if (
    userConfig &&
    typeof userConfig === 'object' &&
    'default' in userConfig &&
    userConfig.default
  ) {
    userConfig = userConfig.default
  }
  const resolvedUserConfig = (await Promise.resolve(
    typeof userConfig === 'function'
      ? userConfig({
          command,
          mode,
          isSsrBuild: !spa,
        })
      : userConfig,
  )) as ExtendedUserConfig
  resolvedUserConfig.fastify = resolvedConfig.fastify

  return [
    Object.assign(resolvedUserConfig, {
      build: {
        assetsDir: resolvedConfig.build.assetsDir,
        outDir: resolvedConfig.build.outDir,
      },
    }),
    configFile,
  ]
}

export { resolveViteConfig }
