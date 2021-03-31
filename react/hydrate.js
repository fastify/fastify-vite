const React = require('react')
const { BrowserRouter } = require('react-router-dom')

function hydrate (app, dataKey = '$data', globalDataKey = '$global') {
  const dataSymbol = Symbol.for(dataKey)
  const globalDataSymbol = Symbol.for(globalDataKey)
  const apiSymbol = Symbol.for('fastify-vite-api')
  const context = {
    [globalDataKey]: window[globalDataSymbol],
    $dataPath: () => `/-/data${document.location.pathname}`,
    [dataKey]: window[dataSymbol],
    $api: window[apiSymbol]
  }
  setupServerAPI(context)
  const { Consumer } = React.createContext(context)

  return React.createElement(BrowserRouter, { children: React.createElement(Consumer, { children: app }) })
}

function setupServerAPI (context) {
  const { $api } = context
  context.$api = new Proxy($api, { get: getFetchWrapper })
}

module.exports = { hydrate }

function getFetchWrapper (methods, method) {
  if (method in methods) {
    if (Array.isArray(!methods[method]) && typeof methods[method] === 'object') {
      return new Proxy(methods[method], { get: getFetchWrapper })
    }
    const hasParams = methods[method][1].match(/\/:(\w+)/)
    if (hasParams) {
      return async (params, options = {}) => {
        options.method = methods[method][0]
        // eslint-disable-next-line no-undef
        const response = await fetch(applyParams(methods[method][1], params), options)
        const body = await response.text()
        return {
          body,
          json: tryJSONParse(body),
          status: response.status,
          headers: response.headers
        }
      }
    } else {
      return async (options = {}) => {
        options.method = methods[method][0]
        // eslint-disable-next-line no-undef
        const response = await fetch(methods[method][1], options)
        const body = await response.text()
        return {
          body,
          json: tryJSONParse(body),
          status: response.status,
          headers: response.headers
        }
      }
    }
  }
}

function applyParams (template, params) {
  try {
    return template.replace(/:(\w+)/g, (_, m) => {
      if (params[m]) {
        return params[m]
      } else {
        // eslint-disable-next-line no-throw-literal
        throw null
      }
    })
  } catch (err) {
    return null
  }
}

function tryJSONParse (str) {
  try {
    return JSON.parse(str)
  } catch (_) {
    return undefined
  }
}
