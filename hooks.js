const { ref, getCurrentInstance } = require('vue')

exports.useSSRData = function useSSRData () {
  const appConfig = getCurrentInstance().appContext.app.config
  const { $ssrData, $ssrDataPath } = appConfig.globalProperties
  return [ ref($ssrData), $ssrDataPath() ]
}
