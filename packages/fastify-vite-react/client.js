const manifetch = require('manifetch')

const { useContext, useState, useEffect, useRef } = require('react')
const { Context, ContextProvider } = require('./context')

const noop = () => {}
const dataKey = '$data'
const globalDataKey = '$global'
const isServer = typeof window === 'undefined'
const rendered = { value: false }
const fetch = isServer ? noop : window.fetch

function useHydration (getData) {
  const firstRender = useRef(rendered)
  const context = useContext(Context)
  if (isServer) {
    return context
  } else {
    const [state, setter] = useState(context)
    useEffect(() => {
      if (!firstRender.current.value) {
        firstRender.current.value = true
        return
      }
      if (!getData) {
        getData = async () => {
          const response = await fetch(context.$dataPath())
          const json = await response.json()
          return json
        }
      }
      setter({ ...state, $loading: false })
      getData(context).then(($data) => {
        setter({ ...state, $data, $loading: false })
      })
    }, [])
    return state
  }
}

function hydrate (app) {
  const dataSymbol = Symbol.for(dataKey)
  const globalDataSymbol = Symbol.for(globalDataKey)
  const apiSymbol = Symbol.for('fastify-vite-api')
  const context = {
    [globalDataKey]: window[globalDataSymbol],
    $dataPath: () => `/-/data${document.location.pathname}`,
    [dataKey]: window[dataSymbol],
    $api: window[apiSymbol],
    requests: [],
  }
  context.$api = new Proxy(context.$api, {
    get: manifetch({
      prefix: '',
      fetch: (...args) => window.fetch(...args),
    }),
  })
  return context
}

module.exports = {
  isServer,
  useHydration,
  hydrate,
  ContextProvider,
}
