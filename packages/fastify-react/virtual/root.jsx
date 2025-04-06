import { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppRoute, Router } from '$app/core.jsx'

export default function Root({ url, routes, head, ctxHydration, routeMap }) {
  console.log('routes', routes)
  return (
    <Suspense>
      <Router location={url}>
        <Routes>
          {routes.map(({ path, component: Component }) => (
            <Route
              key={path}
              path={path}
              element={
                <AppRoute
                  head={head}
                  ctxHydration={ctxHydration}
                  ctx={routeMap[path]}
                >
                  <Component />
                </AppRoute>
              }
            />
          ))}
        </Routes>
      </Router>
    </Suspense>
  )
}
