import { createContext, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export const RouteContext = createContext({})

export function RouteContextProvider ({ ctx, children }) {
  const location = useLocation()
  useEffect(() => {
    // SSR route state inlined hydration needs only be available on first render.
    // We must clear it as soon as the user finishes navigating to the present route
    window.routeState = undefined
    // This runs immediately after first render
  }, [location])
  return (
    <RouteContext.Provider value={ctx}>
      {children}
    </RouteContext.Provider>
  )
}
