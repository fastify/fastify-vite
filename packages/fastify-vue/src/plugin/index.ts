import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import type { Plugin, ResolvedConfig, Rollup, UserConfig } from 'vite'
import viteFastify from '@fastify/vite/plugin'
import {
  prefix,
  resolveId,
  loadSource,
  loadVirtualModule,
  createPlaceholderExports,
} from './virtual.ts'
import { closeBundle } from './preload.ts'
import { parseStateKeys } from './parsers.ts'
import { generateStores } from './stores.ts'
import type { ViteFastifyVueOptions } from '../types/options.ts'

export type { ViteFastifyVueOptions }

interface PluginContext {
  root: string | null
  resolvedConfig?: ResolvedConfig
  resolvedBundle?: Rollup.OutputBundle
  indexHtml?: string
}

export default function viteFastifyVue({ ts }: ViteFastifyVueOptions = {}): Plugin[] {
  const context: PluginContext = {
    root: null,
  }
  const vueFastifyPlugin: Plugin = {
    // https://vite.dev/guide/api-plugin#conventions
    name: 'vite-plugin-vue-fastify',
    config,
    configResolved(config) {
      context.resolvedConfig = config
      context.root = config.root
    },
    resolveId(id) {
      return resolveId.call({ root: context.root as string }, id)
    },
    load(id) {
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
          if (virtual === 'stores') {
            for (const contextPath of [
              join(context.root as string, 'context.js'),
              join(context.root as string, 'context.ts'),
            ]) {
              if (existsSync(contextPath)) {
                const keys = parseStateKeys(readFileSync(contextPath, 'utf8'))
                return generateStores(keys)
              }
            }
            return
          }
          return loadVirtualModule(virtual, { ts })
        }
      }
      return undefined
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle) {
          return
        }
        context.indexHtml = html
        context.resolvedBundle = ctx.bundle
      },
    },
    closeBundle: {
      order: 'post',
      handler() {
        const env = this.environment
        return closeBundle(
          {
            name: env.name,
            root: env.config.root,
            base: env.config.base,
            outDir: env.config.build.outDir,
            assetsInlineLimit: env.config.build.assetsInlineLimit,
          },
          context.resolvedBundle,
        )
      },
    },
  }
  return [
    viteFastify({
      clientModule: ts ? '$app/index.ts' : '$app/index.js',
    }) as Plugin,
    vueFastifyPlugin,
  ]
}

function config(config: UserConfig, { command }: { command: string; isSsrBuild?: boolean }) {
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
  warning: Rollup.RollupLog,
  rollupWarn: (warning: string | Rollup.RollupLog) => void,
) {
  if (
    !(
      warning.code === 'MISSING_EXPORT' &&
      warning.message?.includes?.('"scrollBehavior" is not exported')
    ) &&
    !(
      warning.code === 'PLUGIN_WARNING' &&
      warning.message?.includes?.('dynamic import will not move module into another chunk')
    ) &&
    !(warning.code === 'UNUSED_EXTERNAL_IMPORT' && warning.exporter === 'vue')
  ) {
    rollupWarn(warning)
  }
}
