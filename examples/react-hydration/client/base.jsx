import { Suspense } from 'react'
import { StaticRouter, BrowserRouter, Routes, Route } from 'react-router'
import { Provider as StateProvider } from 'jotai'

import routes from './routes.js'
import { todoList } from './state.js'

const Router = import.meta.env.SSR ? StaticRouter : BrowserRouter

export function createApp (ctx, url) {
  return (
    <StateProvider initialValues={[
      [todoList, ctx.data.todoList]
    ]}>
      <Suspense>
        <Router location={url}>
          <Routes>{
            routes.map(({ path, component: Component }) => {
              return <Route key={path} path={path} element={<Component />} />
            })
          }</Routes>
        </Router>
      </Suspense>
    </StateProvider>
  )
}
