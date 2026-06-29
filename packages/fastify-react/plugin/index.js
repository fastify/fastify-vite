import viteFastify from '@fastify/vite/plugin'
import rsc from '@vitejs/plugin-rsc'
import {
  prefix,
  resolveId,
  loadSource,
  loadVirtualModule,
  createPlaceholderExports,
} from './virtual.js'
import { closeBundle } from './preload.js'

export default function viteFastifyReactPlugin({ ts } = {}) {
  const context = {
    root: null,
  }
  const clientModule = ts ? '$app/index.ts' : '$app/index.js'
  return [
    viteFastify({
      clientModule,
    }),
    rsc({
      serverHandler: false,
    }),
    {
      // https://vite.dev/guide/api-plugin#conventions
      name: 'vite-plugin-react-fastify',
      config,
      configResolved: configResolved.bind(context),
      resolveId: resolveId.bind(context),
      async load(id) {
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
        handler: transformIndexHtml.bind(context),
      },
      closeBundle() {
        closeBundle.call(this, context.resolvedBundle)
      },
    },
  ]
}

function transformIndexHtml(html, { bundle }) {
  if (!bundle) {
    return
  }
  this.indexHtml = html
  this.resolvedBundle = bundle
}

function configResolved(config) {
  this.resolvedConfig = config
  this.root = config.root
}

function config(rawConfig, { command }) {
  if (!rawConfig.environments) {
    rawConfig.environments = {}
  }

  const outDir = rawConfig.build?.outDir ?? 'dist'

  // The RSC environment is needed in both dev and build modes.
  // In dev mode, the module runner needs a null-byte-free virtual module ID.
  // In build mode, Rollup handles the null byte prefix for virtual modules.
  const isBuild = command === 'build'
  rawConfig.environments.rsc = {
    build: {
      outDir: `${outDir}/rsc`,
      rollupOptions: {
        input: {
          index: isBuild ? '\0$app/rsc-entry.jsx' : '$app/rsc-entry.jsx',
        },
      },
    },
    resolve: {
      conditions: ['react-server'],
    },
  }

  if (command === 'build') {
    if (!rawConfig.build) {
      rawConfig.build = {}
    }
    if (!rawConfig.build.rollupOptions) {
      rawConfig.build.rollupOptions = {}
    }
    rawConfig.build.rollupOptions.onwarn = onwarn

    // Don't override buildApp — the @vitejs/plugin-rsc plugin already sets up
    // its own 5-step build pipeline (scan rsc → scan ssr → build rsc → build client → build ssr)
    // which properly handles environment import resolution.
  }
}

function onwarn(warning, rollupWarn) {
  if (
    !(
      warning.code == 'MISSING_EXPORT' &&
      warning.message?.includes?.('"scrollBehavior" is not exported')
    ) &&
    !(
      warning.code == 'PLUGIN_WARNING' &&
      warning.message?.includes?.('dynamic import will not move module into another chunk')
    ) &&
    !(warning.code == 'UNUSED_EXTERNAL_IMPORT' && warning.exporter === 'vue')
  ) {
    rollupWarn(warning)
  }
}
