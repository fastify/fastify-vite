import { existsSync, lstatSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export function resolveClientModule(root: string) {
  for (const ext of ['js', 'mjs', 'mts', 'ts', 'cjs', 'jsx', 'tsx']) {
    const indexFile = join(root, `index.${ext}`)
    if (existsSync(indexFile)) {
      return `/index.${ext}`
    }
  }
  return null
}

export function resolveRoot(path: string) {
  let root = path
  if (root.startsWith('file:')) {
    root = fileURLToPath(root)
  }
  if (lstatSync(root).isFile()) {
    root = dirname(root)
  }
  return root
}

export function findViteConfigJson(appRoot: string, folderNames: string[] = ['dist', 'build']) {
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

export function findConfigFile(root: string) {
  for (const ext of ['js', 'mjs', 'ts']) {
    const configFile = join(root, `vite.config.${ext}`)
    if (existsSync(configFile)) {
      return configFile
    }
  }
}

export async function getApplicationRootDir(root: string) {
  const { packageDirectory } = await import('package-directory')
  return await packageDirectory({ cwd: root })
}
