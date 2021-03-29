const { renderToString } = require('@vue/server-renderer')
const devalue = require('@nuxt/devalue')

const getRender = createApp => async function render (req, url, options) {
  const {dataKey, globalDataKey } = options
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
      script
    },
    attrs: {
      body: bodyAttrs
    },
    element
  }
}

module.exports = { getRender }
