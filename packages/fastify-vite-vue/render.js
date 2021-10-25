const { renderToString } = require('@vue/server-renderer')
const { renderHeadToString } = require('@vueuse/head')
const devalue = require('devalue')
const { assign } = Object

const empty = {}

function createRenderFunction (createApp) {
  return async function render (fastify, req, reply, url, options) {
    const { entry, distManifest, hydration } = options
    const { ctx, app, head, router } = createApp({ fastify, req, reply })

    // On the client, hydrate() from fastify-vite/client repeats these steps
    assign(app.config.globalProperties, {
      [hydration.global]: req[hydration.global],
      [hydration.payload]: req[hydration.payload],
      [hydration.data]: req[hydration.data],
      $payloadPath: () => `/-/payload${req.routerPath}`,
      $api: req.api && req.api.client,
    })

    if (router) {
      router.push(url)
      await router.isReady()
    }

    const element = await renderToString(app, ctx)
    const { headTags, htmlAttrs, bodyAttrs } = head ? renderHeadToString(head) : empty
    const preloadLinks = renderPreloadLinks(ctx.modules, distManifest)
    const hydrationScript = getHydrationScript(req, app.config.globalProperties, hydration)

    return {
      head: {
        preload: preloadLinks,
        tags: headTags,
      },
      attrs: {
        html: htmlAttrs,
        body: bodyAttrs,
      },
      entry: entry.client,
      hydration: hydrationScript,
      element,
    }
  }
}

module.exports = {
  createRenderFunction,
}

function getHydrationScript (req, context, hydration) {
  const globalData = req[hydration.global]
  const data = req[hydration.data] || context[hydration.data]
  const payload = req[hydration.payload] || context[hydration.payload]
  const api = req.api ? req.api.meta : null

  let hydrationScript = ''
  if (globalData || data || payload || api) {
    hydrationScript += '<script>'
    if (globalData) {
      hydrationScript += `window[Symbol.for('kGlobal')] = ${devalue(globalData)}\n`
    }
    if (data) {
      hydrationScript += `window[Symbol.for('kData')] = ${devalue(data)}\n`
    }
    if (payload) {
      hydrationScript += `window[Symbol.for('kPayload')] = ${devalue(payload)}\n`
    }
    if (api) {
      hydrationScript += `window[Symbol.for('kAPI')] = ${devalue(api)}\n`
    }
    hydrationScript += '</script>'
  }
  return hydrationScript
}

function renderPreloadLinks (modules, manifest) {
  if (!modules) {
    return
  }
  let links = ''
  const seen = new Set()
  for (const id of modules) {
    const files = manifest[id]
    if (files) {
      for (const file of files) {
        if (seen.has(file)) {
          continue
        }
        const preloadLink = getPreloadLink(file)
        if (preloadLink) {
          links += `${preloadLink}\n`
        }
        seen.add(file)
      }
    }
  }
  return links
}

// Based on https://github.com/vitejs/vite/blob/main/packages/playground/ssr-vue/src/entry-server.js
function getPreloadLink (file) {
  if (file.endsWith('.js')) {
    return `<link rel="modulepreload" crossorigin href="${file}">`
  } else if (file.endsWith('.css')) {
    return `<link rel="stylesheet" href="${file}">`
  } else if (file.endsWith('.woff')) {
    return ` <link rel="preload" href="${file}" as="font" type="font/woff" crossorigin>`
  } else if (file.endsWith('.woff2')) {
    return ` <link rel="preload" href="${file}" as="font" type="font/woff2" crossorigin>`
  } else if (file.endsWith('.gif')) {
    return ` <link rel="preload" href="${file}" as="image" type="image/gif">`
  } else if (file.endsWith('.jpg') || file.endsWith('.jpeg')) {
    return ` <link rel="preload" href="${file}" as="image" type="image/jpeg">`
  } else if (file.endsWith('.png')) {
    return ` <link rel="preload" href="${file}" as="image" type="image/png">`
  }
}
