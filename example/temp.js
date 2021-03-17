import { ref, getCurrentInstance, useSSRContext } from 'vue'

export function hydrate (app, dataKey = '$data') {
  const dataSymbol = Symbol.for(dataKey)
  app.config.globalProperties.$dataPath = () => `/-/data${document.location.pathname}`
  app.config.globalProperties[dataKey] = window[dataSymbol]
  delete window[dataSymbol]

  const apiSymbol = Symbol.for('fastify-vite-api')
  app.config.globalProperties.$api = window[apiSymbol]
  delete window[apiSymbol]

  setupServerAPI(app.config.globalProperties)
}

export function useServerData (dataKey = '$data') {
  const appConfig = getCurrentInstance().appContext.app.config
  const $data = appConfig.globalProperties[dataKey]
  const $dataPath = appConfig.globalProperties.$dataPath
  return [ref($data), $dataPath()]
}

export function useServerAPI () {
  const appConfig = getCurrentInstance().appContext.app.config
  const { $api } = appConfig.globalProperties
  return $api
}

export function setupServerAPI (globalProperties) {
  const { $api } = globalProperties
  globalProperties.$api = import.meta.env.SSR
    ? useSSRContext().req.api.client
    : new Proxy($api, { get: getFetchWrapper })
}

function getFetchWrapper (methods, method) {
  if (method in methods) {
    if (typeof methods[method] === 'object') {
      return new Proxy(methods[method], { get: getFetchWrapper })
    }
    const hasParams = methods[method].match(/\/:(\w+)/)
    if (hasParams) {
      return async (params, options) => {
        const response = await fetch(applyParams(methods[method], params), {
          options,
        })
        const body = await response.text()
        return {
          body,
          json: tryJSONParse(body),
          status: response.status,
          headers: response.headers,
        }
      }
    } else {
      return async (options) => {
        const response = await fetch(methods[method], {
          options,
        })
        const body = await response.text()
        return {
          body,
          json: tryJSONParse(body),
          status: response.status,
          headers: response.headers,
        }
      }
    }
  }
}

function applyParams (template, params) {
  try {
    return template.replace(/:(\w+)/, (_, m) => {
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
