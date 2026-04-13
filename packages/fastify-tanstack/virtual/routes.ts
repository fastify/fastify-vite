import { createElement, Fragment } from 'react'
import { createRootRoute, createRoute, Outlet, Scripts } from '@tanstack/react-router'

const rootRoute = createRootRoute({
  component: function Root() {
    return createElement(Fragment, null, createElement(Outlet), createElement(Scripts))
  },
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: function Index() {
    return createElement('div', null, 'Hello from TanStack Router SSR')
  },
})

const routeTree = rootRoute.addChildren([indexRoute])

export { routeTree }
export default routeTree
