import { useContext, createContext, useState } from 'react'

export const Context = createContext({})

export const ContextProvider = ({ children, context }) => {
  const [ctx, setctx] = useState(context)
  const setContext = (val) => setctx(Object.assign({}, { ...ctx }, val))
 
  return (
    <Context.Provider value={{context: ctx, setContext}}>
      { children }
    </Context.Provider >
  )
}

export const useTheContext = () => useContext(Context)