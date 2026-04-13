import viteFastify from '@fastify/vite/plugin'
import type { Plugin, ResolvedConfig } from 'vite'
import {
  prefix,
  resolveId,
  loadSource,
  loadVirtualModule,
  createPlaceholderExports,
} from './virtual.ts'
import { closeBundle as closeBundleImpl } from './preload.ts'

interface PluginContext {
  root: string
  resolvedConfig: ResolvedConfig | null
}

export default function viteFastifyTanstackPlugin(): Plugin[] {
  let resolvedBundle: Record<string, unknown> | null = null

  const context: PluginContext = {
    root: '',
    resolvedConfig: null,
  }
  return [
    viteFastify({
      clientModule: '$app/index.ts',
    }),
    {
      name: 'vite-plugin-tanstack-fastify',
      config: configHook,
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
        handler(_html, { bundle }) {
          if (bundle) {
            resolvedBundle = bundle
          }
        },
      },
      closeBundle() {
        closeBundleImpl.call(this, resolvedBundle)
      },
    },
  ]
}

function configResolved(this: PluginContext, config: ResolvedConfig) {
  this.resolvedConfig = config
  this.root = config.root
}

function configHook(config: Record<string, any>, { command }: { command: string }) {
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

function onwarn(
  warning: { code?: string; message?: string },
  rollupWarn: (warning: unknown) => void,
) {
  if (
    !(
      warning.code == 'PLUGIN_WARNING' &&
      warning.message?.includes?.('dynamic import will not move module into another chunk')
    )
  ) {
    rollupWarn(warning)
  }
}
