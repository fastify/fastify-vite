import ReactDOM from 'react-dom'
import { ContextProvider, hydrate } from 'fastify-vite-react/client'
import { createApp } from '@app/client.jsx'

const { App, router: Router } = createApp()

hydrate().then((hydration) => {
  ReactDOM.hydrate(
    <Router>
      <ContextProvider context={hydration}>
        {App()}
      </ContextProvider>
    </Router>,
    document.getElementById('app'),
  )
})
