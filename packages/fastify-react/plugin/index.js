import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import viteFastify from '@fastify/vite/plugin'
import {
  prefix,
  resolveId,
  loadSource,
  loadVirtualModule,
  createPlaceholderExports
} from './virtual.js'
import { closeBundle } from './preload.js'
import { parseStateKeys } from './parsers.js'
import { generateStores } from './stores.js'

export default function viteFastifyReactPlugin ({ ts } = {}) {
  const context = {
    root: null,
  }
  return [viteFastify({
    clientModule: ts ? '$app/index.ts' : '$app/index.js'
  }), {
    // https://vite.dev/guide/api-plugin#conventions
    name: 'vite-plugin-react-fastify',
    config,
    configResolved: configResolved.bind(context),
    resolveId: resolveId.bind(context),
    async load (id) {
      if (id.includes('?server') && !this.environment.config.build?.ssr) {
        const source = loadSource(id)
        return createPlaceholderExports(source)
      }
      if (id.includes('?client') && this.environment.config.build?.ssr) {
        const source = loadSource(id)
        return createPlaceholderExports(source)
      }
      if (prefix.test(id)) {
        const [, virtual] = id.split(prefix)
        if (virtual) {
          return loadVirtualModule(virtual)
        }
      }
    },
    transformIndexHtml: {
      order: 'post',
      handler: transformIndexHtml.bind(context)
    },
    closeBundle () {
      closeBundle.call(this, context.resolvedBundle)
    },
  }]
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

function config (config, { command }) {
  if (command === 'build') {
    if (!config.build) {
      config.build = {}
    }
    if (!config.build.rollupOptions) {
      config.build.rollupOptions = {}
    }
    config.build.rollupOptions.onwarn = onwarn
  }
}

function onwarn (warning, rollupWarn) {
  if (
    !(
      warning.code == 'MISSING_EXPORT' &&
      warning.message?.includes?.('"scrollBehavior" is not exported')
    )
    &&
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
