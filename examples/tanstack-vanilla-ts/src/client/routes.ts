import { createElement, Fragment } from 'react'
import {
  createRootRouteWithContext,
  createRoute,
  Outlet,
  Scripts,
  redirect,
  useLoaderData,
} from '@tanstack/react-router'
import type { RouterContext } from './create.tsx'

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: function Root() {
    return createElement(Fragment, null, createElement(Outlet), createElement(Scripts))
  },
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: '/login' })
    }
  },
  loader: ({ context }) => {
    return { user: context.user! }
  },
  component: function Index() {
    const { user } = useLoaderData({ from: '/' })
    return createElement(
      'div',
      null,
      createElement('h1', null, `Hello ${user.name} from TanStack Router SSR!`),
      createElement(
        'form',
        {
          onSubmit: async (e: { preventDefault: () => void }) => {
            e.preventDefault()
            await fetch('/api/logout', { method: 'POST' })
            window.location.href = '/login'
          },
        },
        createElement('button', { type: 'submit' }, 'Logout'),
      ),
    )
  },
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: function Login() {
    return createElement(
      'div',
      null,
      createElement('h1', null, 'Login'),
      createElement(
        'form',
        {
          onSubmit: async (e: { preventDefault: () => void; target: any }) => {
            e.preventDefault()
            const form = new FormData(e.target)
            await fetch('/api/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: form.get('username') }),
            })
            window.location.href = '/'
          },
        },
        createElement('input', { name: 'username', placeholder: 'Username', required: true }),
        createElement('button', { type: 'submit' }, 'Sign in'),
      ),
    )
  },
})

export const routeTree = rootRoute.addChildren([indexRoute, loginRoute])
