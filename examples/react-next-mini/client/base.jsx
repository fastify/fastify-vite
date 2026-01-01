import { Suspense } from 'react'
import { StaticRouter, BrowserRouter } from 'react-router'

import routes from './routes.js'
import { PageManager } from './next.jsx'

const Router = import.meta.env.SSR ? StaticRouter : BrowserRouter

export function createApp(ctx, url) {
  return (
    <Suspense>
      <Router location={url}>
        <PageManager routes={routes} ctx={ctx} />
      </Router>
    </Suspense>
  )
}
