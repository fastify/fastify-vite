import manifetch from 'manifetch/index.mjs'
import { useContext, createSignal, onMount, lazy } from 'solid-js';
import { isServer } from 'solid-js/web'
import { useParams } from 'solid-app-router'
import { Context, ContextProvider } from 'fastify-vite-solid/context'

const kRoutes = Symbol.for('kRoutes')
const kData = Symbol.for('kData')
const kPayload = Symbol.for('kPayload')
const kStaticPayload = Symbol.for('kStaticPayload')
const kGlobal = Symbol.for('kGlobal')
const kAPI = Symbol.for('kAPI')

const fetch = isServer ? () => {} : window.fetch

let firstRender = !isServer

function useHydration ({ getData, getPayload } = {}) {
  const context = useContext(Context)
  if (isServer) {
    return [context]
  } else {
    const [state, setter] = createSignal(context)
    onMount(() => {
      if (getPayload) {
        const getPayloadFromClient = async () => {
          const response = await fetch(context.$payloadPath())
          const json = await response.json()
          return json
        }
        setter({ ...state(), $loading: true })
        context.fetch = window.fetch
        getPayloadFromClient(context).then(($payload) => {
          setter({ ...state(), $payload, $loading: false })
          hydrationDone()
        })
      } else if (getData) {
        setter({ ...state(), $loading: true })
        context.fetch = window.fetch
        getData(context).then(($data) => {
          setter({ ...state(), $data, $loading: false })
          hydrationDone()
        })
      } else {
        hydrationDone()
      }
    })
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
    // In case app is running without Solid Router
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

function hydrateRoutes (globImports) {
  const routes = window[kRoutes]
  delete window[kRoutes]
  return routes.map((route) => {
    route.component = lazy(() => globImports[route.componentPath]())
    return route
  })
}

function hydrationDone () {
  if (firstRender) {
    firstRender = false
  }
}

// To circumvent Vite's warning of an unused import
const _ContextProvider = ContextProvider

export {
  isServer,
  useHydration,
  hydrate,
  hydrateRoutes,
  ContextProvider,
}
