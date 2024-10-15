import { load, resolveId } from './virtual.js'

export default function viteFastifyVue () {
  const context = {
    root: null,
  }  
  return {
    name: 'vite-plugin-fastify-vue',
    config,
    configResolved: configResolved.bind(context),
    resolveId: resolveId.bind(context),
    load,
    // transformIndexHtml: {
    //   order: 'post',
    //   handler (html, { bundle }) {
    //     if (!bundle) {
    //       return
    //     }
    //     indexHtml = html
    //     resolvedBundle = bundle
    //   }
    // },
  }
}

function configResolved (config) {
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
