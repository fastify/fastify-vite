const React = require('react')
const { renderToString } = require('react-dom/server')
const devalue = require('devalue')
const { Helmet } = require('react-helmet')
const { ContextProvider } = require('./context')

function createRenderFunction (createApp) {
  return async function render (req, url, options) {
    const { entry, hydration } = options
    const { App, router, context } = createApp({
      req,
      $dataPath: () => `/-/data${req.routerPath}`,
      [hydration.global]: req[hydration.global],
      [hydration.data]: req[hydration.data] || null,
      $api: req.api && req.api.client,
    })

    const app = App()
    const element = renderElement(req.url, app, context, router)
    const hydrationScript = getHydrationScript(req, context, hydration)

    return {
      entry: entry.client,
      hydration: hydrationScript,
      element,
      helmet: Helmet.renderStatic(),
    }
  }
}

module.exports = { createRenderFunction }

function getHydrationScript (req, context, hydration) {
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

  return hydrationScript
}

function renderElement (url, app, context, router) {
  if (router) {
    return renderToString(
      React.createElement(router, {
        location: url,
      }, React.createElement(ContextProvider, {
        children: app,
        context,
      })),
    )
  } else {
    return renderToString(
      React.createElement(ContextProvider, { context, children: app }),
    )
  }
}
