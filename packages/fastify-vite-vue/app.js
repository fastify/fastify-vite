const { getCurrentInstance } = require('vue')
const manifetch = require('manifetch')

const { useSSRContext } = require('vue')
const {
  kData,
  kPayload,
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

function useIsomorphic (append) {
  if (isServer) {
    const ssrContext = useSSRContext()
    return Object.assign({
      $error: {},
      $payload: ssrContext.$payload,
      // TODO
      $global: ssrContext.$global,
      $data: ssrContext.$data,
      $api: ssrContext.$api,
    }, append)
  } else {
    if (!appState[kIsomorphic]) {
      appState[kIsomorphic] = {}
    }
    Object.assign(appState[kIsomorphic], {
      $error: {},
      $global: window[kGlobal],
      $api: new Proxy({ ...window[kAPI] }, {
        get: manifetch({
          prefix: '',
          fetch: (...args) => window.fetch(...args),
        }),
      }),
    }, append)
    if (!appState[kIsomorphic].$data) {
      appState[kIsomorphic].$data = window[kData]
      delete window[kData]
    }
    if (!appState[kIsomorphic].$payload) {
      appState[kIsomorphic].$payload = window[kPayload]
      delete window[kPayload]
    }
    return appState[kIsomorphic]
  }
}

function hydrationDone () {
  if (appState[kFirstRender]) {
    appState[kFirstRender] = false
  }
}

function usePayload () {
  const { $error, $payload } = useIsomorphic()
  if ('getPayload' in $error) {
    throw $error.getPayload
  }
  return $payload
}

function useData () {
  const { $error, $data } = useIsomorphic()
  if ('getData' in $error) {
    throw $error.getData
  }
  return $data
}

function useGlobalProperties () {
  return getCurrentInstance().appContext.app.config.globalProperties
}

module.exports = {
  useIsomorphic,
  usePayload,
  useData,
  appState,
  hydrationDone,
  useGlobalProperties,
}
