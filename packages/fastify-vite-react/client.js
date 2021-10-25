const manifetch = require('manifetch')

const { useContext, useState, useEffect } = require('react')
const { useParams } = require('react-router-dom')
const { Context, ContextProvider } = require('./context')

const kData = Symbol.for('kData')
const kPayload = Symbol.for('kPayload')
const kStaticPayload = Symbol.for('kStaticPayload')
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
    },
  })
}

if (!isServer) {
  window.requestIdleCallback(() => {
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

async function hydrate (app) {
  let $payload
  if (window[kStaticPayload]) {
    const staticPayloadResponse = await fetch(window[kStaticPayload])
    $payload = await staticPayloadResponse.json()
  } else {
    $payload = window[kPayload]
  }
  let params
  try {
    params = useParams()
  } catch {
    // In case app is running without React Router
  }
  const context = {
    params,
    $payload,
    $payloadPath: (staticPayload) => {
      if (staticPayload) {
        let { pathname } = Object.assign({}, document.location)
        if (pathname.endsWith('/')) {
          pathname = `${pathname}index`
        }
        return `${pathname.replace('.html', '')}/index.json`
      } else {
        return `/-/payload${document.location.pathname}`
      }
    },
    $static: !!window[kStaticPayload],
    $global: window[kGlobal],
    $data: window[kData],
    $api: new Proxy({ ...window[kAPI] }, {
      get: manifetch({
        prefix: '',
        fetch: (...args) => fetch(...args),
      }),
    }),
  }
  delete window[kGlobal]
  delete window[kData]
  delete window[kPayload]
  delete window[kStaticPayload]
  delete window[kAPI]
  return context
}

module.exports = {
  isServer,
  useHydration,
  hydrate,
  ContextProvider,
}
