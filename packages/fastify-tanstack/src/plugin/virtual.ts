import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { findExports } from 'mlly'

const virtualRoot = resolve(import.meta.dirname, '..', '..', 'virtual')

const virtualModules = ['mount.ts', 'routes.ts', 'create.tsx', 'context.ts', 'index.ts']

export const prefix = /^\/?\$app\//

export async function resolveId(this: { root: string }, id: string) {
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
      return id
    }
  }
}

export function loadVirtualModule(virtual: string): { code: string; map: null } | undefined {
  if (!matchesVirtualModule(virtual)) {
    return
  }
  const codePath = resolve(virtualRoot, virtual)
  return {
    code: readFileSync(codePath, 'utf8'),
    map: null,
  }
}

function matchesVirtualModule(virtual: string): boolean {
  if (!virtual) {
    return false
  }
  for (const entry of virtualModules) {
    if (virtual.startsWith(entry)) {
      return true
    }
  }
  return false
}

function loadVirtualModuleOverride(viteProjectRoot: string, virtual: string): string | undefined {
  if (!matchesVirtualModule(virtual)) {
    return
  }
  const overridePath = resolve(viteProjectRoot, virtual)
  if (existsSync(overridePath)) {
    return overridePath
  }
  const base = overridePath.replace(/\.[^.]+$/, '')
  for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
    const candidate = base + ext
    if (candidate !== overridePath && existsSync(candidate)) {
      return candidate
    }
  }
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
      case 'star':
        pExports += `export ${exp.code}\n`
        break
    }
  }
  return pExports
}
