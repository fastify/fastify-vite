import { createContext, useState, useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

export const SSRContext = createContext({})

export function SSRContextProvider ({ ctx, children }) {
  const location = useLocation()
  const [ssrContext, updateSSRContext] = useState(ctx)
  if (!import.meta.env.SSR) {
    useLayoutEffect(() => {
      updateSSRContext(ssrContext => ({ ...ssrContext, data: null }))
    }, [location])
  }
  return (
    <SSRContext.Provider value={ssrContext}>
      {children}
    </SSRContext.Provider>
  )
}
