import { ref, getCurrentInstance } from 'vue'

export function useSSRData () {
  const appConfig = getCurrentInstance().appContext.app.config
  const { $ssrData, $ssrDataPath } = appConfig.globalProperties
  return [ ref($ssrData), $ssrDataPath() ]
}
