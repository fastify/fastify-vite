import { existsSync, lstatSync, readdirSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { dirname, isAbsolute, join } from 'node:path'
import type { ConfigEnv, UserConfigExport } from 'vite'
import { getApplicationRootDir } from './paths.ts'
import type {
  ExtendedUserConfig,
  ExtendedResolvedViteConfig,
  ResolvedDevViteConfig,
  SerializableViteConfig,
} from '../types/vite-configs.ts'

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

/** Options for resolveDevViteConfig */
export interface ResolveDevViteConfigOptions {
  spa?: boolean
}

/** Options for resolveProdViteConfig */
export interface ResolveProdViteConfigOptions {
  distDir?: string
}

/**
 * Resolves Vite configuration for development mode.
 * Reads the live vite.config file and resolves it via Vite's API.
 *
 * @throws Error if no Vite config file is found
 */
async function resolveDevViteConfig(
  root: string,
  { spa }: ResolveDevViteConfigOptions = {},
): Promise<ResolvedDevViteConfig> {
  const command = 'build'
  const mode = 'development'

  let configFile = findConfigFile(root)
  if (!configFile) {
    throw new Error(`No Vite config file found. Searched for vite.config.{js,mjs,ts} in: ${root}`)
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

  return Object.assign(resolvedUserConfig, {
    fastify: resolvedConfig.fastify,
    build: {
      assetsDir: resolvedConfig.build.assetsDir,
      outDir: resolvedConfig.build.outDir,
    },
  })
}

/**
 * Resolves Vite configuration for production mode.
 * Reads the cached vite.config.json from the dist folder.
 *
 * @throws Error if cached config file is not found
 */
async function resolveProdViteConfig(
  root: string,
  { distDir }: ResolveProdViteConfigOptions = {},
): Promise<SerializableViteConfig> {
  const appRoot = await getApplicationRootDir(root)

  let viteConfigDistFile: string | null
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

  if (!viteConfigDistFile) {
    const searchedIn = distDir || `${appRoot}/{dist,build}`
    throw new Error(
      `Failed to load cached Vite configuration. Searched in: ${searchedIn}\n` +
        `Ensure you have run 'vite build' to generate the production bundle.`,
    )
  }

  return JSON.parse(await readFile(viteConfigDistFile, 'utf-8'))
}

export { resolveDevViteConfig, resolveProdViteConfig }
