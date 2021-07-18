const manifetch = require('manifetch')

const { useContext, useState, useEffect, useRef } = require('react')
const { useLocation } = require('react-router-dom')
const { Context, ContextProvider } = require('./context')

const kData = Symbol.for('kData')
const kPayload = Symbol.for('kPayload')
const kGlobal = Symbol.for('kGlobal')
const kAPI = Symbol.for('kAPI')
const kFirstRender = Symbol.for('kFirstRender')

const isServer = typeof window === 'undefined'
const fetch = isServer ? () => {} : window.fetch

if (!isServer) {
  let firstRender = true
  Object.defineProperty(window, kFirstRender, {
    get () {
      return firstRender
    },
    set (v) {
      firstRender = v
      return firstRender
    }
  })
}

if (!isServer) {
  requestIdleCallback(() => {
    window[kFirstRender] = false
  })
}

function useHydration ({ getData, getPayload } = {}) {
  const context = useContext(Context)
  if (isServer) {
    return [context]
  } else {
    const [state, setter] = useState(context)
    useEffect(() => {
      if (window[kFirstRender]) {
        return
      }
      if (getPayload) {
        const getPayloadFromClient = async () => {
          const response = await fetch(context.$payloadPath())
          const json = await response.json()
          return json
        } 
        setter({ ...state, $loading: true })
        getPayloadFromClient(context).then(($payload) => {
          setter({ ...state, $payload, $loading: false })
        })
      } else if (getData) {
        setter({ ...state, $loading: true })
        getData(context).then(($data) => {
          setter({ ...state, $data, $loading: false })
        })
      }
    }, [])
    const update = (payload) => {
      setter({ ...state, ...payload })
    }
    return [state, update]
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
