import React, { useContext, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StaticRouter } from 'react-router-dom/server'

import { RouteContext, RouterContextProvider } from './context.jsx'
import routes from './routes.js'

const Router = import.meta.env.SSR ? StaticRouter : BrowserRouter

export function createApp (ctx, url) {
  return (
    <Router location={url}>
      <RouterContextProvider ctx={ctx}>
		    <Routes>{
		      routes.map(({ path, component: Component }) => {
		        return <Route key={path} path={path} element={<Component />} />
		      })
		    }</Routes>
      </RouterContextProvider>
    </Router>
  )
}
