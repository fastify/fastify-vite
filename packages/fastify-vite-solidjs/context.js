const { createContext, createComponent } = require('solid-js/web')

const Context = createContext({})

function ContextProvider ({ children, context }) {
  return createComponent(Context.Provider, {
    value: context,
    children: children,
  })
}

module.exports = { ContextProvider, Context }
