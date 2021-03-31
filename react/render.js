const React = require('react')
const { renderToString } = require('react-dom/server')
const { StaticRouter } = require('react-router-dom')
const devalue = require('@nuxt/devalue')

const getRender = createApp => async function render (req, url, options) {
  const { entry, hydration } = options
  const { app } = createApp(req)

  const { Consumer } = React.createContext({
    [hydration.global]: req[hydration.global],
    $dataPath: () => `/-/data${req.routerPath}`,
    [hydration.data]: req[hydration.data],
    $api: req.api && req.api.client
  })

  const test = React.createElement(Consumer, { children: app })
  const Router = React.createElement(StaticRouter, { children: test, location: url })
  const element = renderToString(Router)

  const globalData = req.$global
  const data = req.$data
  const api = req.api ? req.api.meta : null

  let hydrationScript = ''
  console.log(data)
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
