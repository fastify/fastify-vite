const { renderToString } = require('@vue/server-renderer')
const { renderHeadToString } = require('@vueuse/head')
const devalue = require('@nuxt/devalue')

const getRender = createApp => async function render (req, url, options) {
  const { clientEntryPath, distManifest, dataKey, globalDataKey } = options
  const { ctx, app, head, router } = createApp(req)

  // On the client, hydrate() from fastify-vite/hidrate repeats these steps
  app.config.globalProperties[globalDataKey] = req[globalDataKey]
  app.config.globalProperties.$dataPath = () => `/-/data${req.routerPath}`
  app.config.globalProperties[dataKey] = req[dataKey]
  app.config.globalProperties.$api = req.api && req.api.client

  router.push(url)

  await router.isReady()

  const element = await renderToString(app, ctx)
  const { headTags, htmlAttrs, bodyAttrs } = renderHeadToString(head)
  const preloadLinks = renderPreloadLinks(ctx.modules, distManifest)

  const globalData = req[options.globalDataKey]
  const data = req[options.dataKey] || app.config.globalProperties[dataKey]
  const api = req.api ? req.api.meta : null
  let script = ''

  if (globalData || data || api) {
    script += '<script>\nlet key\n'
    if (globalData) {
      script += `key = Symbol.for('${globalDataKey}')\n`
      script += `window[key] = ${devalue(globalData)}\n`
    }
    if (data) {
      script += `key = Symbol.for('${dataKey}')\n`
      script += `window[key] = ${devalue(data)}\n`
    }
    if (api) {
      script += 'key = Symbol.for(\'fastify-vite-api\')\n'
      script += `window[key] = ${devalue(api)}\n`
    }
    script += '</script>'
  }

  return {
    head: {
      preload: preloadLinks,
      tags: headTags,
      script
    },
    attrs: {
      html: htmlAttrs,
      body: bodyAttrs
    },
    entry: clientEntryPath,
    element
  }
}

module.exports = { getRender }

function renderPreloadLinks (modules, manifest) {
  let links = ''
  const seen = new Set()
  for (const id of modules) {
    const files = manifest[id]
    if (files) {
      files.forEach((file) => {
        if (!seen.has(file)) {
          seen.add(file)
          links += renderPreloadLink(file)
        }
      })
    }
  }
  return links
}

function renderPreloadLink (file) {
  if (file.endsWith('.js')) {
    return `<link rel="modulepreload" crossorigin href="${file}">`
  } else if (file.endsWith('.css')) {
    return `<link rel="stylesheet" href="${file}">`
  } else {
    // TODO
    return ''
  }
}
