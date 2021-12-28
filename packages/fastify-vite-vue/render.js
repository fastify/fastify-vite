const { renderToString } = require('@vue/server-renderer')
const { renderHeadToString } = require('@vueuse/head')
const devalue = require('devalue')

function createRenderFunction (createApp) {
  return async function render (fastify, req, reply, url, options) {
    const { entry, distManifest, hydration } = options
    const { ctx, app, head, routes, router } = await createApp({
      fastify,
      req,
      reply,
      [hydration.global]: req[hydration.global],
      [hydration.payload]: req[hydration.payload],
      [hydration.data]: req[hydration.data],
      $payloadPath: () => `/-/payload${req.routerPath}`,
      $api: req.api && req.api.client,
      $errors: {},
    })

    if (router) {
      router.push(url)
      await router.isReady()
    }

    const element = await renderToString(app, ctx)
    const { headTags, htmlAttrs, bodyAttrs } = head ? renderHeadToString(head) : {}
    const preloadLinks = renderPreloadLinks(ctx.modules, distManifest)
    const hydrationScript = getHydrationScript(req, app.config.globalProperties, hydration, routes)

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

function getHydrationScript (req, context, hydration, routes) {
  const globalData = req[hydration.global]
  const data = req[hydration.data] || context[hydration.data]
  const payload = req[hydration.payload] || context[hydration.payload]
  const api = req.api ? req.api.meta : null

  let hydrationScript = ''
  if (routes || globalData || data || payload || api) {
    hydrationScript += '<script>'
    if (routes) {
      const clientRoutes = routes.map(({
        path,
        getPayload,
        getData,
        componentPath,
      }) => {
        return {
          hasPayload: !!getPayload,
          hasData: !!getData,
          path,
          componentPath,
        }
      })
      hydrationScript += addHydration('kRoutes', clientRoutes)
    }
    hydrationScript += addHydration('kGlobal', globalData)
    hydrationScript += addHydration('kData', data)
    hydrationScript += addHydration('kPayload', payload)
    hydrationScript += addHydration('kAPI', api)
    hydrationScript += '</script>'
  }
  return hydrationScript
}

function addHydration (key, hydration) {
  if (hydration) {
    return `window[Symbol.for('${key}')] = ${devalue(hydration)}\n`
  } else {
    return ''
  }
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
