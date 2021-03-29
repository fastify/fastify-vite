const { renderToString } = require('@vue/server-renderer')
const devalue = require('@nuxt/devalue')

const getRender = createApp => async function render(req, url, options) {
  const { entry, distManifest, hydration } = options
  const { app, router } = createApp(req)

  // On the client, hydrate() from fastify-vite/hidrate repeats these steps
  app.config.globalProperties[globalDataKey] = req[globalDataKey]
  app.config.globalProperties.$dataPath = () => `/-/data${req.routerPath}`
  app.config.globalProperties[dataKey] = req[dataKey]
  app.config.globalProperties.$api = req.api && req.api.client

  router.push(url)

  await router.isReady()

  const element = await renderToString(app)

  const globalData = req[options.globalDataKey]
  const data = req[options.dataKey] || app.config.globalProperties[dataKey]
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
    entry: entry.client,
    hydration: hydrationScript,
    element
  }
}

module.exports = { getRender }
