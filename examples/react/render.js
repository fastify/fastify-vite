const React = require('react')
const { renderToString } = require('react-dom/server')
const devalue = require('devalue')
const { Helmet } = require('react-helmet')
const { ContextProvider } = require('./context')

function createRenderFunction (createApp) {
  return async function render (fastify, req, reply, url, options) {
    const { entry, hydration } = options
    const { App, router, routes } = createApp()
    const app = App(routes)
    const element = renderToString(
      React.createElement(router, { children: app, location: req.url }),
    )
    return { element }
  }
}

module.exports = { createRenderFunction }
