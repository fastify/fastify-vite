const React = require('react')
const Context = React.createContext({})

function ContextProvider ({ children, context }) {
  const [ctx, setctx] = React.useState(context)
  const setContext = (val) => setctx(Object.assign({}, { ...ctx }, val))

  return React.createElement(Context.Provider, {
    children,
    value: { context: ctx, setContext },
  })
}

function useSSEContext () {
  return React.useContext(Context)
}

module.exports = { useSSEContext, ContextProvider, Context }
