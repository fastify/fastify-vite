import { createApp } from '../main'
import { renderToString } from '@vue/server-renderer'
import { renderHeadToString } from '@vueuse/head'
import devalue from '@nuxt/devalue'

export async function render (req, url, options) {
  const { clientEntryPath, distManifest, ssrDataKey } = options
  const { ctx, app, head, router } = createApp(req)

  app.config.globalProperties.$ssrDataPath = () => `/-/data${req.routerPath}`
  app.config.globalProperties[ssrDataKey] = req[ssrDataKey]

  router.push(url)

  await router.isReady()

  const element = await renderToString(app, ctx)
  const { headTags, htmlAttrs, bodyAttrs } = renderHeadToString(head)
  const preloadLinks = renderPreloadLinks(ctx.modules, distManifest)

  let ssrData = req[options.ssrDataKey] || ''
  if (ssrData) {
    ssrData = `<script>window.$ssrData = ${devalue(ssrData)}</script>`
  }

  return {
    head: {
      preload: preloadLinks,
      tags: headTags,
      ssrData
    },
    attrs: {
      html: htmlAttrs,
      body: bodyAttrs
    },
    entry: clientEntryPath,
    element
  }
}

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
