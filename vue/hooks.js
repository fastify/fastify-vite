const { getCurrentInstance } = require('vue')

async function useServerData (...args) {
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
  const appInstance = getCurrentInstance()
  const appConfig = appInstance ? appInstance.appContext.app.config : null
  let $data
  if (isSSR && initialData) {
    if (!appConfig) {
      return initialData()
    }
    appConfig.globalProperties[dataKey] = await initialData()
    $data = appConfig.globalProperties[dataKey]
    return $data
  } else if (initialData) {
    if (!appConfig) {
      return initialData()
    }
    if (!appConfig.globalProperties[dataKey]) {
      appConfig.globalProperties[dataKey] = await initialData()
    }
    $data = appConfig.globalProperties[dataKey]
    appConfig.globalProperties[dataKey] = undefined
    return $data
  } else {
    const $data = appConfig.globalProperties[dataKey]
    const $dataPath = appConfig.globalProperties.$dataPath
    appConfig.globalProperties[dataKey] = undefined
    return [$data, $dataPath()]
  }
}

function useServerAPI () {
  const appConfig = getCurrentInstance().appContext.app.config
  const { $api } = appConfig.globalProperties
  return $api
}

module.exports = { useServerData, useServerAPI }
