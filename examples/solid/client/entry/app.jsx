/* eslint-disable react/jsx-key */

import { Router, Route, Routes } from 'solid-app-router'
import routes from './routes.js'

export default function createApp (ctx) {
  return {
    ctx,
    routes,
    Element,
    Router,
  }
}

function Element (props) {
  return (
    <Routes>{
      props.routes.map(({ path, component: Component }) => {
        return (
          <Route path={path} element={<Component />} />
        )
      })
    }</Routes>
  )
}
