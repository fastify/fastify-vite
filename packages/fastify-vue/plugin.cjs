const { readFileSync, existsSync } = require('fs')
const { dirname, join, resolve } = require('path')
const { fileURLToPath } = require('url')

function viteFastifyVue (config = {}) {  
  const prefix = /^\/:/
  const nprefix = /^\$app\//
  const virtualRoot = resolve(__dirname, 'virtual')
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
    'core.js',
    'server.js',
    'stores',
    'hooks'
  ]
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

  let viteProjectRoot

  function loadVirtualModuleOverride (virtual) {
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

  // Thanks to https://github.com/sindresorhus/escape-string-regexp/blob/main/index.js
  function escapeRegExp (s) {
    return s
      .replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
      .replace(/-/g, '\\x2d')
  }

  let parseStateKeys

  return {
    name: 'vite-plugin-fastify-vue',
    config (config, { isSsrBuild, command }) {
      if (command === 'build') {
        config.build.rollupOptions = {
          input: isSsrBuild ? config.build.ssr : '/index.html',
          output: {
            format: 'es',
          },
          onwarn (warning, rollupWarn) {
            if (
              !(
                warning.code == 'PLUGIN_WARNING' && 
                warning.message?.includes?.('dynamic import will not move module into another chunk')
              )
              &&
              !(
                warning.code == 'UNUSED_EXTERNAL_IMPORT' && 
                warning.exporter === 'vue'
              )
            ) {
              rollupWarn(warning)
            }
          }
        }
      }
    },
    configResolved (config) {
      viteProjectRoot = config.root
    },
    async resolveId (id) {
      let _prefix = prefix
      if (nprefix.test(id)) {
        _prefix = nprefix
      }
      const [, virtual] = id.split(_prefix)
      if (virtual) {
        const override = loadVirtualModuleOverride(virtual)
        if (override) {
          return override
        }
        return id
      }
    },
    async load (id) {
      let _prefix = prefix
      if (nprefix.test(id)) {
        _prefix = nprefix
      }
      const [, virtual] = id.split(_prefix)
      if (virtual) {
        if (virtual === 'stores') {
          if (!parseStateKeys) {
            await import('./parsing.js').then((m) => {
              parseStateKeys = m.parseStateKeys
            })
          }
          const { id } = await this._container.moduleGraph.resolveId('/:context.js')
          const keys = parseStateKeys(readFileSync(id, 'utf8'))
          return generateStores(keys)
        }
        return loadVirtualModule(virtual)
      }
    },
  }
}

function generateStores(keys) {
  let code = `
import { useRouteContext } from '@fastify/vue/client'

function storeGetter (proxy, prop) {
  if (!proxy.context) {
    proxy.context = useRouteContext()
  }
  if (prop === 'state') {
    return proxy.context.state
  }
  let method
  if (method = proxy.context.actions[proxy.key][prop]) {
    if (!proxy.wrappers[prop]) {
      proxy.wrappers[prop] = (...args) => {
        return method(proxy.context.state, ...args)
      }
    }
    return proxy.wrappers[prop]
  } else {
    throw new Error('Store action \`\${prop}\` not implemented.')
  }
}
`
  for (const key of keys) {
    code += `
export const ${key} = new Proxy({
  key: '${key}',
  wrappers: {},
  context: null,
}, { 
  get: storeGetter
})
`
  }
  return {
    code,
    map: null
  }
}

module.exports = viteFastifyVue
