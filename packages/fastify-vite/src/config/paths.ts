import { existsSync, lstatSync } from 'node:fs'
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

export async function getApplicationRootDir(root: string) {
  const { packageDirectory } = await import('package-directory')
  return await packageDirectory({ cwd: root })
}
