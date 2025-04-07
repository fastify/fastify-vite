import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { findExports } from 'mlly'

const __dirname = dirname(fileURLToPath(import.meta.url))

const virtualRoot = resolve(__dirname, '..', 'virtual')
const virtualRootTS = resolve(__dirname, '..', 'virtual-ts')

const virtualModules = [
  'mount.js',
  'routes.js',
  'router.vue',
  'layouts/',
  'layout.vue',
  'create.js',
  'root.vue',
  'context.js',
  'index.js',
  'stores',
  'hooks'
]

const virtualModulesTS = [
  'mount.ts',
  'routes.ts',
  'router.vue',
  'layouts/',
  'layout.vue',
  'create.ts',
  'root.vue',
  'context.ts',
  'index.ts',
  'stores',
  'hooks',
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

export function loadVirtualModule (virtualInput, options, virtualModuleInserts) {
  let virtual = virtualInput
  if (!virtual.endsWith('.vue') && !virtual.match(/\.(ts|js)$/)) {
    virtual += options.ts ? '.ts' : '.js'
  }
  if (!virtualModules.includes(virtual) && !virtualModulesTS.includes(virtual)) {
    return
  }
  let virtualRootDir = options.ts ? virtualRootTS : virtualRoot 
  const codePath = resolve(virtualRootDir, virtual)

  let code = readFileSync(codePath, 'utf8')
  if (virtualModuleInserts[virtual]) {
    for (const [key, value] of Object.entries(virtualModuleInserts[virtual])) {
      code = code.replace(new RegExp(escapeRegExp(key), 'g'), value)
    }
  }

  return {
    code,
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

// Thanks to https://github.com/sindresorhus/escape-string-regexp/blob/main/index.js
function escapeRegExp (s) {
  return s
    .replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
    .replace(/-/g, '\\x2d')
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
        pExports += 'export default {}\n'
        break
      case 'declaration':
        pExports += `export const ${exp.name} = {}\n`
        break
    }
  }
  return pExports
}
