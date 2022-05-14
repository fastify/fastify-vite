import { createContext } from 'react'
import { useLocation } from 'react-router-dom'

export const RouterContext = createContext({})

export function RouteContextProvider ({ ctx, children }) {
  return (
    <RouterContext.Provider value={ctx}>
      {children}
    </RouterContext.Provider>
  )
}
