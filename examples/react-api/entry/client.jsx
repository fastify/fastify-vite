import ReactDOM from 'react-dom'
import { ContextProvider, hydrate } from 'fastify-vite-react/client'
import { createApp } from '../main'

const { App, router: Router } = createApp()

ReactDOM.hydrate(
  <Router>
    <ContextProvider context={hydrate()}>
      {App()}
    </ContextProvider>
  </Router>,
  document.getElementById('app'),
)
