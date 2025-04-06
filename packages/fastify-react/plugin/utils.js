import { createHash } from "node:crypto"

export function virtualNormalizeUrlPlugin() {
  return {
    name: virtualNormalizeUrlPlugin.name,
    apply: 'serve',
    resolveId (source, _importer, _options) {
      if (source.startsWith('virtual:normalize-url/')) {
        return '\0' + source
      }
      return
    },
    load(id, _options) {
      if (id.startsWith('\0virtual:normalize-url/')) {
        id = id.slice('\0virtual:normalize-url/'.length)
        id = decodeURIComponent(id)
        return `export default () => import('${id}'')`
      }
      return
    },
  }
}

export function hashString(v) {
  return createHash('sha256').update(v).digest().toString('hex')
}

export function vitePluginSilenceDirectiveBuildWarning() {
  return {
    name: vitePluginSilenceDirectiveBuildWarning.name,
    apply: 'build',
    enforce: 'post',
    config: (config, _env) => ({
      build: {
        rollupOptions: {
          onwarn(warning, defaultHandler) {
            if (
              warning.code === 'SOURCEMAP_ERROR' &&
              warning.message.includes('(1:0)')
            ) {
              return
            }
            if (
              warning.code === 'MODULE_LEVEL_DIRECTIVE' &&
              (warning.message.match(/['"]use client['"]/) ||
                warning.message.match(/['"]use server['"]/))
            ) {
              return
            }
            if (config.build?.rollupOptions?.onwarn) {
              config.build.rollupOptions.onwarn(warning, defaultHandler)
            } else {
              defaultHandler(warning)
            }
          },
        },
      },
    }),
  }
}

export function createVirtualPlugin(nameInput, load) {
  const name = 'virtual:' + nameInput
  return {
    name: `virtual-${name}`,
    resolveId(source, _importer, _options) {
      if (source === name || source.startsWith(`${name}?`)) {
        return `\0${source}`
      }
      return
    },
    load(id, options) {
      if (id === `\0${name}` || id.startsWith(`\0${name}?`)) {
        return load.apply(this, [id, options])
      }
    },
  }
}
