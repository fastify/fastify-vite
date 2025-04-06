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
import { manager, vitePluginUseClient } from './references.js'
import { 
  vitePluginSilenceDirectiveBuildWarning, 
  virtualNormalizeUrlPlugin 
} from './utils.js'
import { createServerModuleRunner } from 'vite'
import { createRSCEnvironment } from './env.js'

export default function viteFastifyReact ({ rsc } = {}) {
  const { configResolved, writeBundle } = viteFastify({
    clientModule: '$app/index.js'
  })
  const context = {
    root: null,
  }
  const configResolvedForVirtual = configResolved.bind(context)
  return [
    vitePluginServerAction(),
    vitePluginUseClient(),
    vitePluginSilenceDirectiveBuildWarning(),
    virtualNormalizeUrlPlugin(),
    {
      name: 'vite-plugin-fastify-react',
      config: config.bind({ rsc: rsc ?? false }),
      configResolved (config) {
        manager.config = config
        configResolved(config)
        configResolvedForVirtual(config)
      },
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
        if (prefix.test(id)) {
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
      writeBundle,
      closeBundle: closeBundle.bind(context),
    }
  ]
}

function transformIndexHtml (html, { bundle }) {
  if (!bundle) {
    return
  }
  this.indexHtml = html
  this.resolvedBundle = bundle
}

function configureServer(server) {
  const reactServerEnv = server.environments.rsc
  // No HMR setup for custom node environment
  const reactServerRunner = createServerModuleRunner(reactServerEnv)
  globalThis.server = server
  globalThis.reactServerRunner = reactServerRunner
}

function configResolved (config) {
  this.resolvedConfig = config
  this.root = config.root
}

async function config (config) {
  const deepMerge = getDeepMergeFunction()
  const {
    resolveClientModule,
    createSSREnvironment,
    createClientEnvironment,
  } = await import('./environments.js')

  config.environments = {}
  config.environments.client = deepMerge(
    createClientEnvironment(),
    config.environments.client ?? {},
  )
  config.environments.ssr = deepMerge(
    createSSREnvironment(clientModule ?? resolveClientModule(config.root)),
    config.environments.ssr ?? {},
  )
  if (this.rsc) {
    config.environments.rsc = createRSCEnvironment()
  }
  if (!config.builder) {
    config.builder = {}
  }
  if (!config.builder.buildApp) {
    if (this.rsc) {
      config.builder.buildApp = async (builder) => {
        // Pre-pass to collect all server/client references
        // by traversing server module graph and going over client boundary
        // TODO: This causes single plugin to be reused by two react-server builds
        manager.buildStep = 'scan'
        await builder.build(builder.environments.rsc)
        manager.buildStep = undefined

        await builder.build(builder.environments.rsc)
        await builder.build(builder.environments.client)
        await builder.build(builder.environments.ssr)
      }
    } else {
      config.builder.buildApp = async (builder) => {
        await builder.build(builder.environments.client)
        await builder.build(builder.environments.ssr)
      }
    }
  }
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
