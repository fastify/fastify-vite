import { createContext } from 'react'
import { useLocation } from 'react-router-dom'

export const RouterContext = createContext({})

export function RouterContextProvider ({ ctx, children }) {
  return (
    <RouterContext.Provider value={ctx}>
      {children}
    </RouterContext.Provider>
  )
}
