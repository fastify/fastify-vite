const manifetch = require('manifetch')
const { useSSRContext } = require('vue')
const {
  kRoutes,
  kData,
  kPayload,
  kStaticPayload,
  kGlobal,
  kAPI,
  kIsomorphic,
  kFirstRender,
} = require('./symbols.js')

const isServer = typeof window === 'undefined'
const appState = {
  [kIsomorphic]: null,
  [kFirstRender]: !isServer,
}

function loadRoutes (views) {
  const routes = []
  for (const view of Object.values(views)) {
    if (view.path && Array.isArray(view.path)) {
      routes.push(
        ...view.path.map((path) => {
          const { default: component, ...viewProps } = view
          return { path, component, ...viewProps }
        }),
      )
    } else if (view.path) {
      const { path, default: component, ...viewProps } = view
      routes.push({ path, component, ...viewProps })
    } else {
      throw new Error('View components need to export a `path` property.')
    }
  }
  return routes.sort((a, b) => {
    if (b.path > a.path) {
      return 1
    } else if (a.path > b.path) {
      return -1
    } else {
      return 0
    }
  })
}

function useIsomorphic () {
  if (isServer) {
    const ssrContext = useSSRContext()
    return {
      $payload: ssrContext.$payload,
      // TODO
      // $static: !!window[kStaticPayload],
      $global: ssrContext.$global,
      $data: ssrContext.$data,
      $api: ssrContext.$api,
    }
  } else {
    if (!appState[kIsomorphic]) {
      appState[kIsomorphic] = {}
    }
    Object.assign(appState[kIsomorphic], {
      $global: window[kGlobal],
      $data: window[kData],
      $api: new Proxy({ ...window[kAPI] }, {
        get: manifetch({
          prefix: '',
          fetch: (...args) => window.fetch(...args),
        }),
      }),
    })
    if (!appState[kIsomorphic].$payload) {
      appState[kIsomorphic].$payload = window[kPayload]
      delete window[kPayload]
    }
    return appState[kIsomorphic]
  }
}

function memoized (func) {
  let value
  let executed = false
  return async function () {
    if (!executed) {
      value = await func()
      executed = true
    }
    return value
  }
}

function hydrateRoutes (globImports) {
  const routes = window[kRoutes]
  delete window[kRoutes]
  return routes.map((route) => {
    route.component = memoized(globImports[route.componentPath])
    return route
  })
}

function hydrationDone () {
  if (appState[kFirstRender]) {
    appState[kFirstRender] = false
  }
}

// function usePayload () {
//   const globalProps = useGlobalProperties()
//     const state = reactive(hydration)
//     if (firstRender) {
//       return state
//     }
//     let promise
//     const getPayloadFromClient = async () => {
//       const response = await window.fetch(hydration.$payloadPath(hydration.$static))
//       const json = await response.json()
//       return json
//     }
//     state.$loading = true
//     promise = getPayloadFromClient({
//       fetch: window.fetch,
//       ...hydration
//     }).then(($payload) => {
//       state.$payload = $payload
//       state.$loading = false
//       return state
//     })
//     return promise
//   }
// }

module.exports = {
  loadRoutes,
  useIsomorphic,
  appState,
  hydrationDone,
}
