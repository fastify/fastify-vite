import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { 
  prefixes,
  resolveId, 
  loadSource, 
  loadVirtualModule,
  createPlaceholderExports
} from './virtual.js'
import { closeBundle } from './preload.js'
import { parseStateKeys } from './parsers.js'
import { generateStores } from './stores.js'

export default function viteFastifyVue () {
  const context = {
    root: null,
  }
  return {
    name: 'vite-plugin-fastify-vue',
    config,
    configResolved: configResolved.bind(context),
    resolveId: resolveId.bind(context),
    async load (id) {
      if (id.includes('?server') && !context.resolvedConfig.build.ssr) {
        const source = loadSource(id)
        return createPlaceholderExports(source)
      }
      if (id.includes('?client') && context.resolvedConfig.build.ssr) {
        const source = loadSource(id)
        return createPlaceholderExports(source)
      }
      const prefix = prefixes.find(_ => _.test(id))
      if (prefix) {
        const [, virtual] = id.split(prefix)
        if (virtual) {
          if (virtual === 'stores') {
            const contextPath = join(context.root, 'context.js')
            if (existsSync(contextPath)) {
              const keys = parseStateKeys(readFileSync(contextPath, 'utf8'))
              return generateStores(keys)
            }
            return
          }
          return loadVirtualModule(virtual)
        }
      }
    },
    transformIndexHtml: {
      order: 'post',
      handler: transformIndexHtml.bind(context)
    },
    closeBundle: closeBundle.bind(context),
  }
}

function transformIndexHtml (html, { bundle }) {
  if (!bundle) {
    return
  }
  this.indexHtml = html
  this.resolvedBundle = bundle
}

function configResolved (config) {
  this.resolvedConfig = config
  this.root = config.root
}

function config (config, { isSsrBuild, command }) {
  if (command === 'build') {
    config.build.rollupOptions = {
      input: isSsrBuild ? config.build.ssr : '/index.html',
      output: {
        format: 'es',
      },
      onwarn
    }
  }
}

function onwarn (warning, rollupWarn) {
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
