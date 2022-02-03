const { createComponent } = require('solid-js/web')
const { createContext } = require('solid-js')

const Context = createContext({})

function ContextProvider (options) {
  return createComponent(Context.Provider, options)
}

module.exports = { ContextProvider, Context }
