const { ref, getCurrentInstance } = require('vue')

function useServerData (dataKey = '$data') {
  const appConfig = getCurrentInstance().appContext.app.config
  const $data = appConfig.globalProperties[dataKey]
  const $dataPath = appConfig.globalProperties.$dataPath
  return [ref($data), $dataPath()]
}

function useServerAPI () {
  const appConfig = getCurrentInstance().appContext.app.config
  const { $api } = appConfig.globalProperties
  return $api
}

module.exports = { useServerData, useServerAPI }
