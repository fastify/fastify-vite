const { normalizeComponentCode } = require('./utils/componentNormalizer.js')
const { vueHotReloadCode } = require('./utils/vueHotReload.js')
const fs = require('fs')
const { parseVueRequest } = require('./utils/query.js')
const { createFilter } = require('@rollup/pluginutils')
const { transformMain } = require('./main.js')
const { compileSFCTemplate } = require('./template.js')
const { getDescriptor } = require('./utils/descriptorCache.js')
const { transformStyle } = require('./style.js')
const { handleHotUpdate } = require('./hmr.js')
const { transformVueJsx } = require('./jsxTransform.js')

const vueComponentNormalizer = '/vite/vueComponentNormalizer'
const vueHotReload = '/vite/vueHotReload'

function createVuePlugin (rawOptions) {
  const options = {
    isProduction: process.env.NODE_ENV === 'production',
    ...rawOptions,
    root: process.cwd(),
  }

  const filter = createFilter(options.include || /\.vue$/, options.exclude)

  return {
    name: 'vite-plugin-vue2',

    config (config) {
      if (options.jsx) {
        return {
          esbuild: {
            include: /\.ts$/,
            exclude: /\.(tsx|jsx)$/,
          },
        }
      }
    },

    handleHotUpdate (ctx) {
      if (!filter(ctx.file)) {
        return
      }
      return handleHotUpdate(ctx, options)
    },

    configResolved (config) {
      options.isProduction = config.isProduction
      options.root = config.root
    },

    configureServer (server) {
      options.devServer = server
    },

    async resolveId (id) {
      if (id === vueComponentNormalizer || id === vueHotReload) {
        return id
      }
      // serve subpart requests (*?vue) as virtual modules
      if (parseVueRequest(id).query.vue) {
        return id
      }
    },

    load (id) {
      if (id === vueComponentNormalizer) {
        return normalizeComponentCode
      }

      if (id === vueHotReload) {
        return vueHotReloadCode
      }

      const { filename, query } = parseVueRequest(id)
      // select corresponding block for subpart virtual modules
      if (query.vue) {
        if (query.src) {
          return fs.readFileSync(filename, 'utf-8')
        }
        const descriptor = getDescriptor(filename)
        let block

        if (query.type === 'script') {
          block = descriptor.script
        } else if (query.type === 'template') {
          block = descriptor.template
        } else if (query.type === 'style') {
          block = descriptor.styles[query.index]
        } else if (query.index != null) {
          block = descriptor.customBlocks[query.index]
        }
        if (block) {
          return {
            code: block.content,
            map: block.map,
          }
        }
      }
    },

    async transform (code, id, transformOptions) {
      const { filename, query } = parseVueRequest(id)

      if (/\.(tsx|jsx)$/.test(id)) {
        return transformVueJsx(code, id, options.jsxOptions)
      }

      if ((!query.vue && !filter(filename)) || query.raw) {
        return
      }

      if (!query.vue) {
        // main request
        return await transformMain(code, filename, options, this)
      }

      const descriptor = getDescriptor(
        query.from ? decodeURIComponent(query.from) : filename,
      )
      // sub block request
      if (query.type === 'template') {
        return compileSFCTemplate(
          code,
          descriptor.template,
          filename,
          options,
          this,
        )
      }
      if (query.type === 'style') {
        return await transformStyle(
          code,
          filename,
          descriptor,
          Number(query.index),
          this,
        )
      }
    },
  }
}

module.exports = {
  createVuePlugin,
}
