import ReactDOM from 'react-dom'
import { ContextProvider, hydrate } from 'fastify-vite/react'
import { createApp } from '../main'

const { app, router: Router } = createApp()
const { context } = hydrate()

ReactDOM.hydrate(
  <Router>
    <ContextProvider context={context}>
      {app()}
    </ContextProvider>
  </Router>,
  document.getElementById('root')
)
