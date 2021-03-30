const React = require('react')
const { renderToString } = require('react-dom/server')
const devalue = require('@nuxt/devalue')

const getRender = createApp => async function render(req, url, options) {
  const { entry, distManifest, hydration } = options
  const { app } = createApp(req)

  // On the client, hydrate() from fastify-vite/hidrate repeats these steps
  
  const element = renderToString(app)

  const globalData = req[options.globalDataKey]
  const data = req[options.dataKey]
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

    hydrationScript += ' window.__vite_plugin_react_preamble_installed__ = true\n'

    hydrationScript += '</script>'
  }

  return {
    entry: entry.client,
    hydration: hydrationScript,
    element
  }
}

module.exports = { getRender }
