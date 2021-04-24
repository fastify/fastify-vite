import ReactDOM from 'react-dom'
import { ContextProvider, hydrate } from 'fastify-vite/client/react'
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
