const manifetch = require('manifetch')

const { useContext, useState, useEffect, useRef } = require('react')
const { Context, ContextProvider } = require('./context')

const dataKey = '$data'
const globalDataKey = '$global'
const isServer = typeof window === 'undefined'

function useIsomorphic (getData, useData) {
  const { context } = useContext(Context)
  const mounted = useRef(true)
  if (isServer) {
    return context
  } else if (getData) {
    const [state, setter] = useState(context)
    useEffect(() => {
      if (mounted.current) {
        mounted.current = false
      }
    }, [])
    useEffect(() => {
      setter({ ...state, $loading: false })
      getData(context).then(($data) => {
        setter({ ...state, $loading: false })
        useData($data)
      })
    }, [])
  }
  return context
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
  useIsomorphic,
  hydrate,
  ContextProvider,
}
