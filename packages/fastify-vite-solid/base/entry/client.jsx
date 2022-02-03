import { Suspense, hydrate as hydrateSolid } from 'solid-js/web'
import { ContextProvider, hydrate } from 'fastify-vite-solid/client.mjs'
import { createApp } from '@app/client.jsx'

const { App, routes, router: Router } = createApp()

hydrate().then(async (hydration) => {
  const resolvedRoutes = await routes()
  hydrateSolid(
    <ContextProvider context={hydration}>
      <Router>
        <Suspense>
          <App routes={resolvedRoutes} />
        </Suspense>
      </Router>
    </ContextProvider>,
    document.getElementById('app'),
  )
})
