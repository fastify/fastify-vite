const React = require('react')

const Context = React.createContext({})

const ContextProvider = ({ children, context }) => {
  const [ctx, setctx] = React.useState(context)
  const setContext = (val) => setctx(Object.assign({}, { ...ctx }, val))

  return React.createElement(Context.Provider, {
    children,
    value: { context: ctx, setContext }
  })
}

const useSSEContext = () => React.useContext(Context)

module.exports = { Context, ContextProvider, useSSEContext }
