import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { findExports } from 'mlly'

const __dirname = dirname(fileURLToPath(import.meta.url))

const virtualRoot = resolve(__dirname, '..', 'virtual')

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

export const prefix = /^\/?\$app\//

export async function resolveId (id) {
  console.log('id', id)
  if (prefix.test(id)) {
    const [, virtual] = id.split(prefix)
    console.log('virtual', virtual)
    if (virtual) {
      console.log('virtual/found', virtual)
      const override = loadVirtualModuleOverride(this.root, virtual)
      console.log('override', override)
      if (override) {
        return override
      }
      return id
    }
  }
}

export function loadVirtualModule (virtualInput) {
  let virtual = virtualInput
  if (!/\.((mc)?ts)|((mc)?js)|(jsx)$/.test(virtual)) {
    virtual += '.js'
  }
  console.log('virtual->', virtual)
  if (!virtualModules.includes(virtual)) {
    return
  }
  console.log('virtual/2->', virtual)
  const code = readFileSync(resolve(virtualRoot, virtual), 'utf8')
  return {
    code,
    map: null,
  }
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

function loadVirtualModuleOverride (viteProjectRoot, virtual) {
  if (!virtualModules.includes(virtual)) {
    return
  }
  const overridePath = resolve(viteProjectRoot, virtual)
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
