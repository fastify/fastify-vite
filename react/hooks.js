function useServerData (props) {
  const dataKey = '$data'
  let initialData
  // if (args.length === 1) {
  //   if (typeof args[0] === 'string') {
  //     dataKey = args[0]
  //   } else if (typeof args[0] === 'function') {
  //     initialData = args[0]
  //   }
  // } else if (args.length > 1) {
  //   dataKey = args[0]
  //   initialData = args[1]
  // }
  const isSSR = typeof window === 'undefined'
  // const appInstance = getCurrentInstance()
  // const appConfig = appInstance ? appInstance.appContext.app.config : null
  let $data
  if (isSSR && initialData) {
    // if (!appConfig) {
    //   return initialData()
    // }
    props[dataKey] = initialData()
    $data = props[dataKey]
    return $data
  } else if (initialData) {
    // if (!appConfig) {
    //   return initialData()
    // }
    if (!props[dataKey]) {
      props[dataKey] = initialData()
    }
    $data = props[dataKey]
    props[dataKey] = undefined
    return $data
  } else {
    const $data = props[dataKey]
    const $dataPath = props.$dataPath
    return [$data, $dataPath()]
  }
}

function useServerAPI () {
  const { $api } = window

  return $api
}

module.exports = { useServerData, useServerAPI }
