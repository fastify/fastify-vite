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

function hydrate (app, dataKey = '$data', globalDataKey = '$global') {
  const dataSymbol = Symbol.for(dataKey)
  app.config.globalProperties.$dataPath = () => `/-/data${document.location.pathname}`
  app.config.globalProperties[dataKey] = window[dataSymbol]
  delete window[dataSymbol]

  const globalDataSymbol = Symbol.for(globalDataKey)
  app.config.globalProperties[globalDataKey] = window[globalDataSymbol]
  delete window[globalDataSymbol]

  const apiSymbol = Symbol.for('fastify-vite-api')
  app.config.globalProperties.$api = window[apiSymbol]
  delete window[apiSymbol]

  setupServerAPI(app.config.globalProperties)
}

module.exports = { hydrate, useServerData, useServerAPI }

function setupServerAPI (globalProperties) {
  const { $api } = globalProperties
  globalProperties.$api = import.meta.env.SSR
    ? useSSRContext().req.api.client
    : new Proxy($api, { get: getFetchWrapper })
}

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
