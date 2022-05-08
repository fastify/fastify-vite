import React, { useContext, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StaticRouter } from 'react-router-dom/server'
import { RouteContext, RouteContextProvider } from './context.jsx'
import routes from './routes.js'

const Router = import.meta.env.SSR
  ? StaticRouter
  : BrowserRouter

export function createRouter (routeState, url) {
  return (
    <Router location={url}>
      <RouteContextProvider ctx={routeState}>
        <RouteComponents routes={routes} />
      </RouteContextProvider>
    </Router>
  )
}

export function useRouteState (stateLoader) {
  const ssrRouteState = useContext(RouteContext)
  const [routeState, update] = useState(
    import.meta.env.SSR
      ? { ...ssrRouteState, loading: false }
      : { ...window.routeState, loading: !window.routeState },
  )
  useEffect(() => {
    if (!routeState.loading) {
      return
    }
    stateLoader().then((updatedState) => {
      update(routeState => ({
        ...routeState,
        ...updatedState,
        loading: false,
      }))
    }).catch((error) => {
      update(routeState => ({
        ...routeState,
        loading: false,
        error,
      }))
    })
  }, [])
  return [routeState, {
    setState (...args) {
      update(...args)
    },
    setData (setter) {
      update({ data: setter(routeState.data) })
    },
    setError (setter) {
      update({ error: setter() })
    },
  }]
}

function RouteComponents (props) {
  return (
    <Routes>{
      props.routes.map(({ path, component: Component }) => {
        return <Route key={path} path={path} element={<Component />} />
      })
    }</Routes>
  )
}
