const { ref, getCurrentInstance } = require('vue')

exports.useServerData = function useServerData (dataKey) {
  const appConfig = getCurrentInstance().appContext.app.config
  const $data = appConfig.globalProperties[dataKey]
  const $dataPath = appConfig.globalProperties.$dataPath
  return [ref($data), $dataPath()]
}

exports.useServerAPI = function useServerAPI () {
  const appConfig = getCurrentInstance().appContext.app.config
  const { $api } = appConfig.globalProperties
  return $api
}

function getFetchWrapper (methods, method) {
  if (method in methods) {
    if (typeof methods[method] === 'object') {
      return new Proxy(methods[method], { get: getFetchWrapper })
    }
    return options => fetch(methods[method], options)
  }
}
