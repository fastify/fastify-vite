const { renderToString } = require('@vue/server-renderer')
const { renderHeadToString } = require('@vueuse/head')
const devalue = require('@nuxt/devalue')
const empty = {}

const getRender = createApp => async function render (req, url, options) {
  const { entry, distManifest, hydration } = options
  const { ctx, app, head, router } = createApp(req)

  // On the client, hydrate() from fastify-vite/hidrate repeats these steps
  app.config.globalProperties[hydration.global] = req[hydration.global]
  app.config.globalProperties.$dataPath = () => `/-/data${req.routerPath}`
  app.config.globalProperties[hydration.data] = req[hydration.data]
  app.config.globalProperties.$api = req.api && req.api.client

  router.push(url)

  await router.isReady()

  const element = await renderToString(app, ctx)
  const { headTags, htmlAttrs, bodyAttrs } = head ? renderHeadToString(head) : empty
  const preloadLinks = renderPreloadLinks(ctx.modules, distManifest)

  const globalData = req[hydration.global]
  const data = req[hydration.data] || app.config.globalProperties[hydration.data]
  const api = req.api ? req.api.meta : null

  let hydrationScript = ''

  if (globalData || data || api) {
    hydrationScript += '<script>\nlet key\n'
    if (globalData) {
      hydrationScript += `key = Symbol.for('${hydration.global}')\n`
      hydrationScript += `window[key] = ${devalue(globalData)}\n`
    }
    if (data) {
      hydrationScript += `key = Symbol.for('${hydration.data}')\n`
      hydrationScript += `window[key] = ${devalue(data)}\n`
    }
    if (api) {
      hydrationScript += 'key = Symbol.for(\'fastify-vite-api\')\n'
      hydrationScript += `window[key] = ${devalue(api)}\n`
    }
    hydrationScript += '</script>'
  }

  return {
    head: {
      preload: preloadLinks,
      tags: headTags
    },
    attrs: {
      html: htmlAttrs,
      body: bodyAttrs
    },
    entry: entry.client,
    hydration: hydrationScript,
    element
  }
}

export { getRender }

// module.exports = { getRender }

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
