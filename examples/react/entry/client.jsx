import ReactDOM from 'react-dom'
import { ContextProvider, hydrate } from 'fastify-vite-react/client'
import { createApp } from '../main'

const { app, router: Router } = createApp()

ReactDOM.hydrate(
  <Router>
    <ContextProvider context={hydrate()}>
      {app()}
    </ContextProvider>
  </Router>,
  document.getElementById('app')
)
