const React = require('react')
const Context = React.createContext({})

function ContextProvider ({ children, context }) {
  return React.createElement(Context.Provider, {
    children,
    value: context,
  })
}

module.exports = { ContextProvider, Context }
