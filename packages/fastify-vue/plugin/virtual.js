import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { findExports } from 'mlly'
import { parseStateKeys } from './parsers.js'
import { generateStores } from './stores.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const virtualRoot = resolve(__dirname, '..', 'virtual')
const prefixes = [/^\/:/, /^\$app\//]

const virtualModules = [ 
  'mount.js',
  'mount.ts',
  'routes.js',
  'router.vue',
  'layout.vue',
  'create.js',
  'create.ts',
  'root.vue',
  'layouts/',
  'context.js',
  'context.ts',
  'index.js',
  'index.ts',
  'stores',
  'hooks'
]

export async function resolveId (id) {
  const prefix = prefixes.find(_ => _.test(id))
  if (prefix) {
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

export async function load (id) {
  if (id.includes('?server') && !ssr) {
    const source = loadSource(id)
    return createPlaceholderExports(source)
  }
  if (id.includes('?client') && ssr) {
    const source = loadSource(id)
    return createPlaceholderExports(source)
  }
  const prefix = prefixes.find(_ => _.test(id))
  if (prefix) {
    const [, virtual] = id.split(prefix)
    if (virtual) {
      if (virtual === 'stores') {
        const { id } = await this._container.moduleGraph.resolveId('/:context.js')
        const keys = parseStateKeys(readFileSync(id, 'utf8'))
        return generateStores(keys)
      }
      return loadVirtualModule(virtual)
    }
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


function loadVirtualModule (virtual) {
  if (!virtual.includes('.')) {
    const code = readFileSync(resolve(virtualRoot, `${virtual}.js`), 'utf8')
    return {
      code,
      map: null,
    }
  }
  if (!virtualModules.includes(virtual)) {
    return
  }
  const code = readFileSync(resolve(virtualRoot, virtual), 'utf8')
  return {
    code,
    map: null,
  }
}

function loadSource (id) {
  const filePath = id
    .replace(/\?client$/, '')
    .replace(/\?server$/, '')
  return readFileSync(filePath, 'utf8')
}

function createPlaceholderExports (source) {
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
