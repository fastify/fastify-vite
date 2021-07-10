const { getCurrentInstance, reactive } = require('vue')
const manifetch = require('manifetch')

const kHydration = Symbol('kHydration')
const kData = Symbol.for('kData')
const kGlobal = Symbol.for('kGlobal')
const kAPI = Symbol.for('kAPI')

const isServer = typeof window === 'undefined'
const firstRender = { value: true }
const fetch = isServer ? () => {} : window.fetch

function useHydration (getData) {
  const globalProps = useGlobalProperties()
  const hydration = globalProps[kHydration]
  if (isServer) {
    return hydration
  } else {
    const state = reactive(hydration)
    if (!firstRender.value) {
      firstRender.value = true
      return
    }
    if (!getData) {
      getData = async () => {
        const response = await fetch(hydration.$payloadPath())
        const json = await response.json()
        return json
      }
    }
    state.$loading = true
    const promise = getData(state).then(($data) => {
      state.$data = $data
      state.$loading = false
    })
    for (const key in hydration) {
      Object.defineProperty(promise, key, {
        enumerable: true,
        get: () => state[key],
        set: (value) => {
          state[key] = value
          return state[key]
        },
      })
    }
    return promise
  }
}

function hydrate (app) {
  useGlobalProperties()[kHydration] = {
    $global: window[kGlobal],
    $data: window[kData],
    $payloadPath: () => `/-/data${document.location.pathname}`,
    $api: new Proxy({ ...window[kAPI] }, {
      get: manifetch({
        prefix: '',
        fetch: (...args) => fetch(...args),
      }),
    }),
  }
  delete window[kGlobal]
  delete window[kData]
  delete window[kAPI]
}

export function useGlobalProperties () {
  return getCurrentInstance().appContext.app.config.globalProperties
}

module.exports = {
  useHydration,
  hydrate,
}
