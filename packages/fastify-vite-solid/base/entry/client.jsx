import { hydrate as hydrateSolid } from 'solid-js/web'
import { ContextProvider, hydrate } from 'fastify-vite-solid/client.mjs'
import { createApp } from '@app/client.jsx'

const { App, routes, router: Router } = createApp()

hydrate().then(async (hydration) => {
  const app = App(await routes())
  hydrateSolid(
    <Router>
      <ContextProvider context={hydration}>
        {app}
      </ContextProvider>
    </Router>,
    document.getElementById('app'),
  )
})
