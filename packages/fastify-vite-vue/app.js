const { reactive, getCurrentInstance, useSSRContext } = require('vue')
const { useRoute } = require('vue-router')
const manifetch = require('manifetch')
const {
  kData,
  kPayload,
  kGlobal,
  kStaticPayload,
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
      $error: ssrContext.req.$error,
      $errors: ssrContext.$errors,
      $payload: ssrContext.$payload,
      $global: ssrContext.$global,
      $data: ssrContext.$data,
      $api: ssrContext.$api,
    }, append)
  } else {
    if (!appState[kIsomorphic]) {
      appState[kIsomorphic] = reactive({
        $error: null,
        $errors: {},
      })
    }
    Object.assign(appState[kIsomorphic], {
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
  const ctx = useIsomorphic()
  if ('getPayload' in ctx.$errors) {
    ctx.$error = ctx.$errors.getPayload
    return false
  }
  return ctx.$payload
}

function useData () {
  const ctx = useIsomorphic()
  if ('getData' in ctx.$errors) {
    ctx.$error = ctx.$errors.getData
    return
  }
  return ctx.$data
}

function useGlobalProperties () {
  return getCurrentInstance().appContext.app.config.globalProperties
}

function usePayloadPath (route) {
  if (window[kStaticPayload]) {
    let { pathname } = Object.assign({}, document.location)
    if (pathname.endsWith('/')) {
      pathname = `${pathname}index`
    }
    return `${pathname.replace('.html', '')}/index.json`
  } else {
    return `/-/payload${route.path}`
  }
}

async function fetchPayload (route) {
  const payloadURL = usePayloadPath(route)
  const response = await window.fetch(payloadURL)
  return response.json()
}

module.exports = {
  useIsomorphic,
  usePayload,
  useData,
  useRoute,
  appState,
  hydrationDone,
  useGlobalProperties,
  usePayloadPath,
  fetchPayload,
}
