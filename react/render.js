const React = require('react')
const { renderToString } = require('react-dom/server')
const devalue = require('@nuxt/devalue')
const { Helmet } = require('react-helmet');

const Context = React.createContext({})

const getRender = createApp => async function render(req, url, options) {
  const { entry, hydration } = options
  const { app, router } = createApp(req)

  const { Provider } = React.createContext()
  let htmlBody
  const context = {
    [hydration.global]: req[hydration.global],
    $dataPath: () => `/-/data${req.routerPath}`,
    [hydration.data]: req[hydration.data],
    $api: req.api && req.api.client
  }
  const setContext = (val) => Object.assign({}, { ...context }, val);

  if (router) {
    htmlBody = React.createElement(router, {
      children: React.createElement(Provider, {
        children: app,
        value: { context, setContext }
      }),
      location: url
    })
  } else {
    htmlBody = React.createElement(Provider, {
      children: app,
      value: { context: ctx, setContext }
    })
  }

  const element = renderToString(htmlBody)
  const globalData = req.$global
  const data = req.$data
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
    element,
    helmet: Helmet.renderStatic()
  }
}

module.exports = { getRender }
