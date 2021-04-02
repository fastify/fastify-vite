function useServerData({ context, setContext }, effect) {
  let dataKey = '$data'
  let initialData

  if (typeof effect === 'function') {
    initialData = effect
  }
  // else if (args.length > 1) {
  //   dataKey = args[0]
  //   initialData = args[1]
  // }
  const isSSR = typeof window === 'undefined'

  if (isSSR && initialData) {
    // if (!appConfig) {
    //   return initialData()
    // }
    setContext({ [dataKey]: initialData() })
    return initialData()
  } else if (initialData) {
    // if (!appConfig) {
    //   return initialData()
    // }
    if (!context[dataKey]) {
      setContext({ [dataKey]: initialData() })
    }

    setContext({ [dataKey]: undefined })
    return undefined
  } else {
    const $data = context[dataKey]
    const $dataPath = context.$dataPath
    return [$data, $dataPath()]
  }
}

module.exports = { useServerData }
