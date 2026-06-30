import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { findExports } from 'mlly'

const virtualRoot = resolve(import.meta.dirname, '..', 'virtual')
const virtualRootTS = resolve(import.meta.dirname, '..', 'virtual-ts')
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
  'rsc-entry.jsx',
  'ssr-entry.jsx',
  'rsc-content.jsx',
  'valtio-hydrator.jsx',
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
  'rsc-entry.tsx',
  'ssr-entry.tsx',
  'rsc-content.tsx',
  'valtio-hydrator.tsx',
]

// Vite marks virtual modules with a null byte (\0) internally.
// Strip it before checking against the $app prefix.
// Use charCodeAt check instead of regex to avoid no-control-regex lint rule.
function stripNullByte(id) {
  return id.charCodeAt(0) === 0 ? id.slice(1) : id
}

export const prefix = /^\/?\$app\//

export async function resolveId(id, importer) {
  // Paths are prefixed with .. on Windows by the glob import
  if (process.platform === 'win32' && /^\.\.\/[C-Z]:/.test(id)) {
    return id.substring(3)
  }

  const cleanId = stripNullByte(id)
  if (prefix.test(cleanId)) {
    const [, virtual] = cleanId.split(prefix)
    if (virtual) {
      const override = loadVirtualModuleOverride(this.root, virtual)
      if (override) {
        return override
      }
      return `\0$app/${virtual}`
    }
  }

  // Resolve relative imports from virtual modules (e.g., './ssr-entry.jsx' from '\0$app/rsc-entry.jsx')
  if (importer && prefix.test(stripNullByte(importer)) && cleanId.startsWith('./')) {
    const importerPath = stripNullByte(importer)
    const importerParts = importerPath.split('/')
    const dir = importerParts.slice(0, -1).join('/')
    const resolved = `${dir}/${cleanId.slice(2)}`
    if (prefix.test(resolved)) {
      const [, virtual] = resolved.split(prefix)
      if (virtual) {
        return `\0$app/${virtual}`
      }
    }
  }
}

export function loadVirtualModule(virtualInput) {
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

function loadVirtualModuleOverride(viteProjectRoot, virtualInput) {
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

export function loadSource(id) {
  const filePath = id.replace(/\?client$/, '').replace(/\?server$/, '')
  return readFileSync(filePath, 'utf8')
}

export function createPlaceholderExports(source) {
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
