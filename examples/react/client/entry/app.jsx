import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StaticRouter } from 'react-router-dom/server'
import routes from './routes.js'

const Router = import.meta.env.SSR
  ? StaticRouter
  : BrowserRouter

export function createApp (ctx) {
  return {
    ctx,
    routes,
    Element,
    Router,
  }
}

function Element (routes) {
  return (
    <Routes>{
      routes.map(({ path, component: Component }) => {
        return <Route key={path} path={path} element={<Component />} />
      })
    }</Routes>
  )
}
