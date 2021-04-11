const React = require('react')

const Context = React.createContext({})

function ContextProvider ({ children, context }) {
  const [ctx, setctx] = React.useState(context)
  const setContext = (val) => setctx(Object.assign({}, { ...ctx }, val))

  return React.createElement(Context.Provider, {
    children,
    value: { context: ctx, setContext }
  })
}

function useSSEContext () {
  return React.useContext(Context)
}

function useServerData (...args) {
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
  const { context } = useSSEContext()

  if (isSSR && initialData) {
    if (!context[dataKey] || Object.keys(context[dataKey]).length === 0) {
      context.requests.push(initialData())
      return
    }

    return context[dataKey]
  } else if (initialData) {
    if (!context[dataKey] || Object.keys(context[dataKey]).length === 0) {
      initialData().then((value) => {
        context[dataKey] = value
      }).catch(err => console.log(err))
      return
    }
    const $data = Object.assign({}, context[dataKey])
    context[dataKey] = {}
    return $data
  } else {
    const $data = Object.assign({}, context[dataKey])
    context[dataKey] = {}
    const $dataPath = context.$dataPath
    return [$data, $dataPath()]
  }
}

function useServerAPI () {
  const { context } = useSSEContext()
  return context.$api
}

function hydrate (app, dataKey = '$data', globalDataKey = '$global') {
  const dataSymbol = Symbol.for(dataKey)
  const globalDataSymbol = Symbol.for(globalDataKey)
  const apiSymbol = Symbol.for('fastify-vite-api')
  const context = {
    [globalDataKey]: window[globalDataSymbol],
    $dataPath: () => `/-/data${document.location.pathname}`,
    [dataKey]: window[dataSymbol],
    $api: window[apiSymbol],
    requests: []
  }
  setupServerAPI(context)

  return {
    context
  }
}

module.exports = {
  ContextProvider,
  useSSEContext,
  useServerData,
  useServerAPI,
  hydrate,
}

function setupServerAPI (context) {
  const { $api } = context
  context.$api = new Proxy($api, { get: getFetchWrapper })
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
