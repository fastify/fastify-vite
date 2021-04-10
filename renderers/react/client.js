const React = require('react')

const Context = React.createContext({})

function ContextProvider ({ children, context }) {
  const [ctx, setctx] = React.useState(context)
  const setContext = (val) => setctx(Object.assign({}, { ...ctx }, val))

  return React.createElement(Context.Provider, {
    children,
    value: { context: ctx, setContext }
  })
}

function useSSEContext () {
  return React.useContext(Context)
}

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
  const { context } = useSSEContext()

  if (isSSR && initialData) {
    if (!context[dataKey] || Object.keys(context[dataKey]).length === 0) {
      context.requests.push(initialData())
      return
    }

    return context[dataKey]
  } else if (initialData) {
    if (!context[dataKey] || Object.keys(context[dataKey]).length === 0) {
      initialData().then((value) => {
        context[dataKey] = value
      }).catch(err => console.log(err))
      return
    }
    const $data = Object.assign({}, context[dataKey])
    context[dataKey] = {}
    return $data
  } else {
    const $data = Object.assign({}, context[dataKey])
    context[dataKey] = {}
    const $dataPath = context.$dataPath
    return [$data, $dataPath()]
  }
}

function useServerAPI () {
  const { context } = useSSEContext()
  return context.$api
}

module.exports = {
  ContextProvider,
  useSSEContext
  useServerData,
  useServerAPI
}
