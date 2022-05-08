import React, { useContext, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { StaticRouter } from 'react-router-dom/server'
import { RouteContext } from './context.jsx'
import routes from './routes.js'

const Router = import.meta.env.SSR
  ? StaticRouter
  : BrowserRouter

export default function createApp (ctx) {
  return {
    ctx,
    routes,
    Element,
    Router,
  }
}

export function useRouteState (dataLoader) {
  const ssrRouteState = useContext(RouteContext)
  const [routeState, update] = useState(
    import.meta.env.SSR
      ? { ...ssrRouteState, loading: false }
      : { ...window.hydration, loading: !window.hydration }
  )
  useEffect(() => {
    if (!routeState.loading) {
      return
    }
    dataLoader().then((data) => {
      update(routeState => ({
        ...routeState,
        data,
        loading: false,
      }))
    }).catch((error) => {
      update(routeState => ({
        ...routeState,
        loading: false,
        error
      }))
    })
  })
  return [routeState, {
    setRouteState (setter) {
      update(setter(routeState))
    },
    setRouteData (setter) {
      update({ data: setter(routeState.data) })
    },
    setRouteError (setter) {
      update({ data: setter(routeState.data) })
    },
  }]
}

function Element (props) {
  return (
    <Routes>{
      props.routes.map(({ path, component: Component }) => {
        return <Route key={path} path={path} element={<Component />} />
      })
    }</Routes>
  )
}
