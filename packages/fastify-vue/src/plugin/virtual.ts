import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { findExports } from 'mlly'

// Compiled path: dist/plugin/virtual.js, so we go up two levels to reach
// the package root where virtual/ and virtual-ts/ live alongside dist/.
const virtualRoot = resolve(import.meta.dirname, '..', '..', 'virtual')
const virtualRootTS = resolve(import.meta.dirname, '..', '..', 'virtual-ts')

// Virtual module stems, without `.js`/`.ts` extension. Resolved against
// either `virtual/` or `virtual-ts/` based on the plugin's `ts` option.
const virtualModuleStems: readonly string[] = [
  'mount',
  'routes',
  'router.vue',
  'layouts/',
  'layout.vue',
  'create',
  'root.vue',
  'context',
  'index',
  'stores',
  'hooks',
]

function stripExt(virtual: string): string {
  return virtual.replace(/\.(js|ts)$/, '')
}

function hasVirtualPrefix(virtual: string): boolean {
  if (!virtual) {
    return false
  }
  const stem = stripExt(virtual)
  for (const entry of virtualModuleStems) {
    if (stem.startsWith(entry)) {
      return true
    }
  }
  return false
}

export const prefix = /^\/?\$app\//

interface ResolveCtx {
  root: string
}

export function resolveId(this: ResolveCtx, id: string): string | undefined {
  // Paths are prefixed with .. on Windows by the glob import
  if (process.platform === 'win32' && /^\.\.\/[C-Z]:/.test(id)) {
    return id.substring(3)
  }

  if (prefix.test(id)) {
    const [, virtual] = id.split(prefix)
    if (virtual) {
      const override = loadVirtualModuleOverride(this.root, virtual)
      if (override) {
        return override
      }
      return `/$app/${virtual}`
    }
  }
  return undefined
}

export interface LoadedVirtualModule {
  code: string
  map: null
}

export function loadVirtualModule(
  virtualInput: string,
  options: { ts?: boolean },
): LoadedVirtualModule | undefined {
  let virtual = virtualInput
  if (!virtual.endsWith('.vue') && !virtual.match(/\.(ts|js)$/)) {
    virtual += options.ts ? '.ts' : '.js'
  }
  if (!hasVirtualPrefix(virtual)) {
    return
  }
  const virtualRootDir = options.ts ? virtualRootTS : virtualRoot
  const codePath = resolve(virtualRootDir, virtual)
  return {
    code: readFileSync(codePath, 'utf8'),
    map: null,
  }
}

function loadVirtualModuleOverride(viteProjectRoot: string, virtual: string): string | undefined {
  if (!hasVirtualPrefix(virtual)) {
    return
  }
  const base = resolve(viteProjectRoot, virtual)
  const candidates = virtual.endsWith('.vue') ? [base] : [base, base.replace(/\.js$/, '.ts')]
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate
    }
  }
  return undefined
}

export function loadSource(id: string): string {
  const filePath = id.replace(/\?client$/, '').replace(/\?server$/, '')
  return readFileSync(filePath, 'utf8')
}

export function createPlaceholderExports(source: string): string {
  let pExports = ''
  for (const exp of findExports(source)) {
    switch (exp.type) {
      case 'named':
        for (const name of exp.names) {
          pExports += `export const ${name} = {}\n`
        }
        break
      case 'default':
        pExports += `export default {}\n`
        break
      case 'declaration':
        pExports += `export const ${exp.name} = {}\n`
        break
    }
  }
  return pExports
}
