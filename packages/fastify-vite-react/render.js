const React = require('react')
const { renderToString } = require('react-dom/server')
const devalue = require('devalue')
const { Helmet } = require('react-helmet')
const { ContextProvider } = require('./context')

const getRender = createApp => async function render (req, url, options) {
  const { entry, hydration } = options
  const { app, router } = createApp(req)

  let htmlBody
  const context = {
    [hydration.global]: req[hydration.global],
    $dataPath: () => `/-/data${req.routerPath}`,
    [hydration.data]: req[hydration.data] || {},
    $api: req.api && req.api.client,
    requests: [],
  }
  const theapp = app()

  if (router) {
    console.log('router')

    /**
     * Mount app to push requests
     */
    renderToString(React.createElement(router, {
      children: React.createElement(ContextProvider, {
        children: theapp,
        context: context,
      }),
      location: url,
    }))

    const resolved = await Promise.all(context.requests)

    // Attach data on context from requests
    resolved.forEach((value) => {
      Object.keys(value).forEach((itemKey) => {
        context.$data[itemKey] = value[itemKey]
      })
    })

    // Return body
    htmlBody = React.createElement(router, {
      children: React.createElement(ContextProvider, {
        children: theapp,
        context: context,
      }),
      location: url,
    })
  } else {
    const resolved = await Promise.all(context.requests)

    // Attach data on context from requests
    resolved.forEach((value) => {
      Object.keys(value).forEach((itemKey) => {
        context.$data[itemKey] = value[itemKey]
      })
    })

    htmlBody = React.createElement(ContextProvider, {
      children: app,
      value: { context: context },
    })
  }

  const element = renderToString(htmlBody)
  const globalData = req.$global
  const data = req.$data || context.$data
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
    helmet: Helmet.renderStatic(),
  }
}

module.exports = { getRender }
