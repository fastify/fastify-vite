import { resolve } from 'node:path'
import { createRequire } from 'node:module'
import { transformWithOxc } from 'vite'
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

// Resolve @vitejs/plugin-rsc from our own dependencies, since pnpm may not hoist it
// to the project root's node_modules. This is needed for Rolldown to resolve bare
// specifiers from virtual modules (which have no physical file path for resolution).
// Also used at runtime in the dev server's module runner for RSC virtual modules
// which import from @vitejs/plugin-rsc subpaths.
let rscPkgResolved
let rscRequire
try {
  rscRequire = createRequire(import.meta.url)
  rscPkgResolved = rscRequire.resolve('@vitejs/plugin-rsc').replace(/\\/g, '/')
  // Strip the resolved file (dist/index.js) to get the package root
  rscPkgResolved = rscPkgResolved.replace(/\/dist\/index\.js$/, '')
} catch {
  // Will be handled by fallback resolution
}

// Resolve #runtime alias path used by virtual modules (e.g. #runtime/route-utils.js)
// Same as in the config hook's runtimeAlias definition.
const runtimeAliasPath = resolve(import.meta.dirname, '..')

export default function viteFastifyReactPlugin({ ts } = {}) {
  const context = {
    root: null,
    ts: ts ?? false,
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
      resolveId(id, importer) {
        // In dev mode, Vite 6 does not propagate resolve.alias from the
        // environment config to the module runner. Virtual module imports
        // (e.g. #runtime/route-utils.js, @vitejs/plugin-rsc/rsc) need
        // explicit resolution here.
        if (rscRequire && id.startsWith('@vitejs/plugin-rsc/') && !id.includes('/vendor/')) {
          try {
            return { id: rscRequire.resolve(id) }
          } catch {
            // Fall through to the standard resolveId
          }
        }
        if (id.startsWith('#runtime/')) {
          return { id: id.replace('#runtime', runtimeAliasPath) }
        }
        // Resolve youch from virtual modules (rsc-entry.jsx catch block uses it)
        if (rscRequire && id === 'youch') {
          try {
            return { id: rscRequire.resolve('youch') }
          } catch {
            // Fall through if not resolvable
          }
        }
        return resolveId.call(context, id, importer)
      },
      async load(id) {
        if (id.includes('?server') && !this.environment.config.build?.ssr) {
          const source = loadSource(id)
          return createPlaceholderExports(source)
        }
        if (id.includes('?client') && this.environment.config.build?.ssr) {
          const source = loadSource(id)
          return createPlaceholderExports(source)
        }
        // Strip Vite's \0 virtual module prefix before matching $app prefix
        const virtualId = id.charCodeAt(0) === 0 ? id.slice(1) : id
        if (prefix.test(virtualId)) {
          const [, virtual] = virtualId.split(prefix)
          if (virtual) {
            // During SSR scan builds, skip 'use client' components to avoid
            // resolving browser-only imports (e.g. @vitejs/plugin-rsc/browser)
            // from virtual modules that have no physical file path resolution base.
            if (this.environment.config.build?.ssr && this.environment.mode === 'build') {
              const vmod = loadVirtualModule(virtual)
              if (vmod && vmod.code?.includes("'use client'")) {
                return createPlaceholderExports(vmod.code)
              }
              return vmod
            }
            const vmod = loadVirtualModule(virtual)
            if (vmod && (virtual.endsWith('.jsx') || virtual.endsWith('.tsx'))) {
              // Transform JSX → JS in the load hook because vite:oxc's filter
              // (from @rollup/pluginutils) rejects \0-prefixed virtual module IDs.
              const result = await transformWithOxc(vmod.code, virtual, {
                jsx: { runtime: 'automatic', jsxImportSource: 'react' },
              })
              return { code: result.code, map: result.map, moduleType: 'js' }
            }
            return vmod
          }
        }
      },
      transform: {
        order: 'pre',
        handler(code, id) {
          // Transform JSX in virtual modules before rsc:scan-strip runs,
          // since es-module-lexer (used by rsc:scan-strip) can't parse JSX.
          if (id.includes('\0$app/') && (id.endsWith('.jsx') || id.endsWith('.tsx'))) {
            return transformWithOxc(code, id, {
              jsx: { runtime: 'automatic', jsxImportSource: 'react' },
            })
          }
        },
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

  // Set up #runtime alias for shared utilities (e.g. route-utils.js)
  const packageDir = resolve(import.meta.dirname, '..')
  const runtimeAlias = { find: '#runtime', replacement: packageDir }

  // Resolve @vitejs/plugin-rsc aliases so Rolldown can find bare specifiers
  // from virtual modules (which have no physical file path for resolution base).
  // pnpm may not hoist this package to the project root's node_modules.
  const rscPkgAlias = rscPkgResolved
    ? { find: '@vitejs/plugin-rsc', replacement: rscPkgResolved + '/dist' }
    : null
  const resolveAliases = [runtimeAlias, rscPkgAlias].filter(Boolean)

  // The RSC environment is needed in both dev and build modes.
  // In dev mode, the module runner needs a null-byte-free virtual module ID.
  // In build mode, Rollup handles the null byte prefix for virtual modules.
  // Deep-merge with existing rsc config to preserve settings from @vitejs/plugin-rsc
  // (e.g. resolve.noExternal, emitAssets, optimizeDeps).
  const isBuild = command === 'build'
  const entryExt = this?.ts ? 'tsx' : 'jsx'
  const existingRsc = rawConfig.environments.rsc ?? {}

  // Resolve react-router's react-server entry for the RSC environment.
  // We use this as an alias so Vite resolves 'react-router' to the
  // react-server entry without relying on the 'react-server' export condition,
  // which also affects 'react' resolution (causing the server stub without hooks).
  let reactRouterRscEntry
  try {
    const rootRequire = createRequire(resolve(rawConfig.root, '_'))
    const rrPkgDir = dirname(rootRequire.resolve('react-router/package.json'))
    reactRouterRscEntry = resolve(rrPkgDir, 'dist/development/index-react-server.mjs')
  } catch {
    // fallback: rely on conditions
  }

  rawConfig.environments.rsc = {
    ...existingRsc,
    keepProcessEnv: false,
    build: {
      ...existingRsc.build,
      outDir: `${outDir}/rsc`,
      rolldownOptions: undefined,
      rollupOptions: {
        ...existingRsc.build?.rollupOptions,
        input: {
          'rsc-entry': isBuild ? `\0$app/rsc-entry.${entryExt}` : `$app/rsc-entry.${entryExt}`,
        },
      },
    },
    resolve: {
      ...existingRsc.resolve,
      alias: [
        // Alias react-router to its react-server entry so RSC imports
        // (unstable_matchRSCServerRequest, unstable_RSCStaticRouter, etc.)
        // resolve correctly WITHOUT needing the 'react-server' export condition.
        // Keeping the default conditions means 'react' resolves to its full entry
        // (with hooks), avoiding the dispatcher mismatch issue.
        ...(reactRouterRscEntry
          ? [{ find: /^react-router$/, replacement: reactRouterRscEntry }]
          : []),
        ...resolveAliases,
      ],
    },
    esbuild: {
      ...existingRsc.esbuild,
      jsx: 'automatic',
      jsxImportSource: 'react',
    },
  }

  // Also ensure @vitejs/plugin-rsc is resolvable in the SSR build
  if (rawConfig.environments.ssr?.resolve) {
    const ssrAliases = rawConfig.environments.ssr.resolve.alias ?? []
    if (rscPkgResolved && !ssrAliases.some((a) => a.find === '@vitejs/plugin-rsc')) {
      rawConfig.environments.ssr.resolve.alias = [...ssrAliases, rscPkgAlias]
    }
  }

  // Prevent duplicate React copies. @vitejs/plugin-rsc forces react and
  // react-dom into the SSR environment's noExternal (build) and
  // optimizeDeps.include (dev). In fastify-vite, the SSR bundle is loaded
  // by a host server that provides its own React via react-dom/server.
  // Bundling React into the SSR bundle creates a second copy whose hooks
  // dispatcher is null — causing "Invalid hook call" on non-RSC pages.
  if (rawConfig.environments.ssr) {
    const ssr = rawConfig.environments.ssr

    // Build: externalize React so the SSR bundle imports from host
    if (ssr.resolve?.noExternal && Array.isArray(ssr.resolve.noExternal)) {
      ssr.resolve.noExternal = ssr.resolve.noExternal.filter(
        (pkg) => pkg !== 'react' && pkg !== 'react-dom' && pkg !== 'react-router',
      )
    }
    // Ensure react-router shares the same instance across the RSC and SSR
    // bundles — the SSR entry is imported at runtime by the RSC handler via
    // import.meta.viteRsc.import(), and separate react-router copies cause
    // "You cannot render a <Router> inside another <Router>" errors.
    if (!ssr.external) ssr.external = []
    if (Array.isArray(ssr.external)) {
      ssr.external.push('react-router')
    }

    // Dev: don't pre-bundle React so Vite's SSR module runner resolves
    // to the same node_modules copy as the host server
    if (ssr.optimizeDeps?.include) {
      ssr.optimizeDeps.include = ssr.optimizeDeps.include.filter(
        (pkg) =>
          pkg !== 'react' &&
          pkg !== 'react-dom' &&
          !pkg.startsWith('react/') &&
          !pkg.startsWith('react-dom/'),
      )
    }
  }

  // Also clean up the RSC environment's optimizeDeps.include — same reason
  if (rawConfig.environments.rsc?.optimizeDeps?.include) {
    rawConfig.environments.rsc.optimizeDeps.include =
      rawConfig.environments.rsc.optimizeDeps.include.filter(
        (pkg) =>
          pkg !== 'react' &&
          pkg !== 'react-dom' &&
          !pkg.startsWith('react/') &&
          !pkg.startsWith('react-dom/'),
      )
  }

  // Also ensure @vitejs/plugin-rsc is resolvable in the client build.
  // Virtual modules ($app/rsc-content.jsx) import from @vitejs/plugin-rsc/browser
  // and need this alias since they have no physical filesystem path for resolution.
  if (rscPkgResolved) {
    const clientResolve = rawConfig.environments.client?.resolve ?? {}
    const clientAliases = clientResolve.alias ?? []
    if (!clientAliases.some((a) => a.find === '@vitejs/plugin-rsc')) {
      rawConfig.environments.client = {
        ...rawConfig.environments.client,
        resolve: { ...clientResolve, alias: [...clientAliases, rscPkgAlias] },
      }
    }
  }

  // Also set at the top level for Vite's optimizer, which uses the
  // top-level resolve.alias via createBackCompatIdResolver (for client
  // and ssr environment dependency resolution in optimizeDeps.include).
  if (rscPkgResolved) {
    const topAliases = rawConfig.resolve?.alias ?? []
    if (!topAliases.some((a) => a.find === '@vitejs/plugin-rsc')) {
      rawConfig.resolve = {
        ...rawConfig.resolve,
        alias: [...topAliases, rscPkgAlias],
      }
    }
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
