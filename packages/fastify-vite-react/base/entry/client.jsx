import ReactDOM from 'react-dom'
import { ContextProvider, hydrate } from 'fastify-vite-react/client.mjs'
import { createApp } from '@app/client.jsx'

const { App, routes, router: Router } = createApp()

hydrate().then(async (hydration) => {
  const app = App(await routes())
  ReactDOM.hydrate(
    <Router>
      <ContextProvider context={hydration}>
        {app}
      </ContextProvider>
    </Router>,
    document.getElementById('app'),
  )
})
