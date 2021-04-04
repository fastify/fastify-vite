<<<<<<< HEAD:renderers/react/react/hydrate.js
const React = require('react')
=======
const { useSSRContext } = require('vue')
const { getCurrentInstance } = require('vue')

async function useServerData (...args) {
  let dataKey = '$data'
  let initialData
  if (args.length === 1) {
    if (typeof args[0] === 'string') {
      dataKey = args[0]
    } else if (typeof args[0] === 'function') {
      initialData = args[0]
    }
  } else if (args.length > 1) {
    dataKey = args[0]
    initialData = args[1]
  }
  const isSSR = typeof window === 'undefined'
  const appInstance = getCurrentInstance()
  const appConfig = appInstance ? appInstance.appContext.app.config : null
  let $data
  if (isSSR && initialData) {
    if (!appConfig) {
      return initialData()
    }
    appConfig.globalProperties[dataKey] = await initialData()
    $data = appConfig.globalProperties[dataKey]
    return $data
  } else if (initialData) {
    if (!appConfig) {
      return initialData()
    }
    if (!appConfig.globalProperties[dataKey]) {
      appConfig.globalProperties[dataKey] = await initialData()
    }
    $data = appConfig.globalProperties[dataKey]
    appConfig.globalProperties[dataKey] = undefined
    return $data
  } else {
    const $data = appConfig.globalProperties[dataKey]
    const $dataPath = appConfig.globalProperties.$dataPath
    appConfig.globalProperties[dataKey] = undefined
    return [$data, $dataPath()]
  }
}

function useServerAPI () {
  const appConfig = getCurrentInstance().appContext.app.config
  const { $api } = appConfig.globalProperties
  return $api
}
>>>>>>> 54d4e0830731d48496c34b05e1ab49a445b4304b:renderers/vue/client.js

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

  return React.createElement(Consumer, { children: app })
}

<<<<<<< HEAD:renderers/react/react/hydrate.js
function setupServerAPI (context) {
  const { $api } = context
  context.$api = new Proxy($api, { get: getFetchWrapper })
=======
module.exports = { hydrate, useServerData, useServerAPI }

function setupServerAPI (globalProperties) {
  const { $api } = globalProperties
  globalProperties.$api = import.meta.env.SSR
    ? useSSRContext().req.api.client
    : new Proxy($api, { get: getFetchWrapper })
>>>>>>> 54d4e0830731d48496c34b05e1ab49a445b4304b:renderers/vue/client.js
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
