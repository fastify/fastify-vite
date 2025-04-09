import { Suspense } from 'react'
import { Route, Routes, matchRoutes } from 'react-router-dom'
import { AppRoute, Router } from '$app/core.jsx'

export default function Root({ url, routes, head, ctxHydration, routeMap }) {
  if (import.meta.env.SSR && !ctxHydration.streaming) {
    // If a matching route is found, render only that route
    const Component = ctxHydration.req.routeOptions.config.element
    return (
      <Suspense>
        <AppRoute
          head={head}
          ctxHydration={ctxHydration}
          ctx={routeMap[ctxHydration.req.route.path]}>
          <Component />
        </AppRoute>
      </Suspense>
    );
  }
  return (
    <Suspense>
      <Router location={url}>
        <Routes>
          {routes.map(({ path, element: Component }) => (
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
