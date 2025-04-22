import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { findExports } from 'mlly'

const __dirname = dirname(fileURLToPath(import.meta.url))

const virtualRoot = resolve(__dirname, '..', 'virtual')
const virtualRootTS = resolve(__dirname, '..', 'virtual-ts')

const virtualModules = [
  'mount.js',
  'resource.js',
  'routes.js',
  'layouts.js',
  'create.jsx',
  'root.jsx',
  'layouts/',
  'context.js',
  'core.jsx',
  'index.js',
]

const virtualModulesTS = [
  'mount.ts',
  'resource.ts',
  'routes.ts',
  'layouts.ts',
  'create.tsx',
  'root.tsx',
  'layouts/',
  'context.ts',
  'core.tsx',
  'index.ts',
]

export const prefix = /^\/?\$app\//

export async function resolveId (id) {
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
      return id
    }
  }
}

export function loadVirtualModule (virtualInput) {
  let virtual = virtualInput
  if (!virtualModules.includes(virtual) && !virtualModulesTS.includes(virtual)) {
    return
  }
  let virtualRootDir = virtualRoot
  if (virtualInput.match(/\.tsx?$/)) {
    virtualRootDir = virtualRootTS
  }
  const codePath = resolve(virtualRootDir, virtual)
  return {
    code: readFileSync(codePath, 'utf8'),
    map: null,
  }
}


virtualModulesTS.includes = function (virtual) {
  if (!virtual) {
    return false
  }
  for (const entry of this) {
    if (virtual.startsWith(entry)) {
      return true
    }
  }
  return false
}


virtualModules.includes = function (virtual) {
  if (!virtual) {
    return false
  }
  for (const entry of this) {
    if (virtual.startsWith(entry)) {
      return true
    }
  }
  return false
}

function loadVirtualModuleOverride (viteProjectRoot, virtualInput) {
  let virtual = virtualInput
  if (!virtualModules.includes(virtual) && !virtualModulesTS.includes(virtual)) {
    return
  }
  let overridePath = resolve(viteProjectRoot, virtual) 
  if (existsSync(overridePath)) {
    return overridePath
  }
  overridePath = overridePath.replace('.js', '.ts')
  if (existsSync(overridePath)) {
    return overridePath
  }
}

export function loadSource (id) {
  const filePath = id
    .replace(/\?client$/, '')
    .replace(/\?server$/, '')
  return readFileSync(filePath, 'utf8')
}

export function createPlaceholderExports (source) {
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
