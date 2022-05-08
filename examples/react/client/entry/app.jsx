import React, { useContext, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
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
  const [state, update] = useState(
    import.meta.env.SSR
      ? { ...ssrRouteState, loading: false }
      : { ...window.routeState, loading: !window.routeState }
  )
  useEffect(() => {
    if (!state.loading) {
      return
    }
    stateLoader().then((updatedState) => {
      update(state => ({
        ...state,
        ...updatedState,
        loading: false,
      }))
    }).catch((error) => {
      update(state => ({
        ...state,
        loading: false,
        error
      }))
    })
  }, [])
  return [state, {
    setState (...args) {
      update(...args)
    },
    setData (setter) {
      update({ data: setter(state.data) })
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
