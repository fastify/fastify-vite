import { createContext, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export const RouteContext = createContext({})

export function RouteContextProvider ({ ctx, children }) {
  const location = useLocation()
  useEffect(() => {
    window.hydration = undefined
  }, [location])
  return (
    <RouteContext.Provider value={ctx}>
    	{children}
    </RouteContext.Provider>
  )
}
