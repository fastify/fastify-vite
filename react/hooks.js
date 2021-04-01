function useServerData (...args) {
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
    // if (!appConfig) {
    //   return initialData()
    // }
    this[dataKey] = initialData()
    $data = this[dataKey]
    return $data
  } else if (initialData) {
    // if (!appConfig) {
    //   return initialData()
    // }
    if (!this[dataKey]) {
      this[dataKey] = initialData()
    }
    $data = this[dataKey]
    this[dataKey] = undefined
    return $data
  } else {
    console.log(this)
    const $data = this[dataKey]
    const $dataPath = this.$dataPath
    return [$data, $dataPath()]
  }
}

function useServerAPI () {
  const { $api } = window

  return $api
}

module.exports = { useServerData, useServerAPI }
