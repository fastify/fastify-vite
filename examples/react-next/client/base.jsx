import React, { Suspense } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { StaticRouter } from 'react-router-dom/server'
import { Provider as StateProvider } from 'jotai'

import routes from './routes.js'
import { PageManager } from './next.jsx'

const Router = import.meta.env.SSR ? StaticRouter : BrowserRouter

export function createApp (ctx, url) {
  return (
    <Suspense>
      <Router location={url}>
        <PageManager routes={routes} ctx={ctx} />
      </Router>
    </Suspense>
  )
}

