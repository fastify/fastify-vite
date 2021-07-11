const manifetch = require('manifetch')

const { useContext, useState, useEffect, useRef } = require('react')
const { Context, ContextProvider } = require('./context')

const kData = Symbol.for('kData')
const kPayload = Symbol.for('kPayload')
const kGlobal = Symbol.for('kGlobal')
const kAPI = Symbol.for('kAPI')

const isServer = typeof window === 'undefined'
const rendered = { value: false }
const fetch = isServer ? () => {} : window.fetch

function useHydration ({ getData, getPayload } = {}) {
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
      if (getPayload) {
        console.log('getPayload is set')
        const getPayloadFromClient = async () => {
          const response = await fetch(context.$payloadPath())
          const json = await response.json()
          return json
        }
        setter({ ...state, $loading: false })
        console.log('getPayloadFromClient()')
        getPayloadFromClient(context).then(($payload) => {
          setter({ ...state, $payload, $loading: false })
        })
      } else if (getData) {
        setter({ ...state, $loading: false })
        getData(context).then(($data) => {
          setter({ ...state, $data, $loading: false })
        })
      }
    }, [])
    return state
  }
}

function hydrate (app) {
  const context = {
    $global: window[kGlobal],
    $payloadPath: () => `/-/payload${document.location.pathname}`,
    $payload: window[kPayload],
    $data: window[kData],
    $api: window[kAPI],
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
