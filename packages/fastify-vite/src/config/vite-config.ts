import { existsSync, lstatSync, readdirSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { dirname, isAbsolute, join } from 'node:path'
import { getApplicationRootDir } from './paths.ts'
import type { ExtendedResolvedViteConfig, SerializableViteConfig } from '../types/vite-configs.ts'

const VITE_CONFIG_JSON = 'vite.config.json'

export function findViteConfigJson(appRoot: string, folderNames: string[] = ['dist', 'build']) {
  for (const folderName of folderNames) {
    const folder = join(appRoot, folderName)

    // Check folder/vite.config.json
    let configPath = join(folder, VITE_CONFIG_JSON)
    if (existsSync(configPath)) {
      return configPath
    }

    // Check one level deeper (e.g., dist/client/vite.config.json)
    try {
      for (const entry of readdirSync(folder)) {
        const entryPath = join(folder, entry)
        if (lstatSync(entryPath).isDirectory()) {
          configPath = join(entryPath, VITE_CONFIG_JSON)
          if (existsSync(configPath)) {
            return configPath
          }
        }
      }
    } catch {
      // Directory doesn't exist or can't be read
    }

    // Check client/folder/ - common pattern for projects with nested client folder
    configPath = join(appRoot, 'client', folderName, VITE_CONFIG_JSON)
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
export async function resolveDevViteConfig(root: string): Promise<ExtendedResolvedViteConfig> {
  const configFile = findConfigFile(root)
  if (!configFile) {
    throw new Error(`No Vite config file found. Searched for vite.config.{js,mjs,ts} in: ${root}`)
  }

  const { resolveConfig } = await import('vite')
  return await resolveConfig({ configFile }, 'serve', 'development')
}

/**
 * Resolves Vite configuration for production mode.
 * Reads the cached vite.config.json from the dist folder.
 *
 * @throws Error if cached config file is not found
 */
export async function resolveProdViteConfig(
  root: string,
  { distDir }: ResolveProdViteConfigOptions = {},
): Promise<SerializableViteConfig> {
  const appRoot = await getApplicationRootDir(root)

  let viteConfigDistFile: string | null
  if (distDir) {
    if (isAbsolute(distDir)) {
      viteConfigDistFile = join(dirname(distDir), VITE_CONFIG_JSON)
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
        `Ensure you have run 'vite build' to generate the production bundle.\n` +
        `If you intended to run in development mode, set the 'dev' option to true.`,
    )
  }

  return JSON.parse(await readFile(viteConfigDistFile, 'utf-8'))
}
