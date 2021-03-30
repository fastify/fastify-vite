
function useServerData(...args) {
  let dataKey = '$data'
  let initialData
  if (args.length === 1) {
    if (typeof args[0] === 'string') {
      dataKey = args[0]
    } else if (typeof args[0] === 'function') {
      initialData = args[0]
    }
  } else if (args.length > 1) {
    dataKey = args[0]
    initialData = args[1]
  }
  const isSSR = typeof window === 'undefined'
  // const appInstance = getCurrentInstance()
  // const appConfig = appInstance ? appInstance.appContext.app.config : null
  let $data
  if (isSSR && initialData) {
    if (!appConfig) {
      return initialData()
    }
    window[dataKey] = initialData()
    $data = window[dataKey]
    return $data
  } else if (initialData) {
    if (!appConfig) {
      return initialData()
    }
    if (!window[dataKey]) {
      window[dataKey] = initialData()
    }
    $data = window[dataKey]
    window[dataKey] = undefined
    return $data
  } else {
    const $data = window[dataKey]
    const $dataPath = window.$dataPath
    window[dataKey] = undefined
    return [$data, $dataPath()]
  }
}

function useServerAPI() {
  const { $api } = window

  return $api
}

module.exports = { useServerData, useServerAPI }
