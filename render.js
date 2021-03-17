import { renderToString } from '@vue/server-renderer'
import { renderHeadToString } from '@vueuse/head'
import devalue from '@nuxt/devalue'

async function render (req, url, options) {
  const { clientEntryPath, distManifest, dataKey } = options
  const { ctx, app, head, router } = createApp(req)

  app.config.globalProperties.$ssrDataPath = () => `/-/data${req.routerPath}`
  app.config.globalProperties[dataKey] = req[dataKey]

  router.push(url)

  await router.isReady()

  const element = await renderToString(app, ctx)
  const { headTags, htmlAttrs, bodyAttrs } = renderHeadToString(head)
  const preloadLinks = renderPreloadLinks(ctx.modules, distManifest)

  let data = req[options.dataKey] || ''
  let api = req.api ? req.api.meta : null

  if (data) {
    data = (
      '<script>' +
      `const dataSymbol = Symbol.for('${dataKey}')\n` +
      `window[dataSymbol] = ${devalue(data)}\n` +
      '</script>'
    )
  }

  if (data) {
    api = (
      '<script>' +
      `const apiSymbol = Symbol.for('fastify-vite-api')\n` +
      `window[apiSymbol] = ${devalue(api)}\n` +
      '</script>'
    )
  }

  return {
    head: {
      preload: preloadLinks,
      tags: headTags,
      data,
      api,
    },
    attrs: {
      html: htmlAttrs,
      body: bodyAttrs
    },
    entry: clientEntryPath,
    element
  }
}

module.exports = { render }

function renderPreloadLinks (modules, manifest) {
  let links = ''
  const seen = new Set()
  modules.forEach((id) => {
    const files = manifest[id]
    if (files) {
      files.forEach((file) => {
        if (!seen.has(file)) {
          seen.add(file)
          links += renderPreloadLink(file)
        }
      })
    }
  })
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
