import ReactDOM from 'react-dom'
import { hydrate } from 'fastify-vite/react'

import { createApp } from '../main'
import { ContextProvider } from 'fastify-vite/react'

const { app, router: Router } = createApp()
const { context } = hydrate();

ReactDOM.hydrate(
  <Router>
    <ContextProvider context={context}>
      {app()}
    </ContextProvider>
  </Router>,
  document.getElementById('root')
)
