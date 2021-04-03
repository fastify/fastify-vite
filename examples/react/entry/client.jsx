import { createApp } from '../main'
import { hydrate } from 'fastify-vite/react'
import ReactDOM from 'react-dom'
const { app, router: Router } = createApp()

ReactDOM.hydrate(
  <Router>
    {hydrate(app)}
  </Router>,
  document.getElementById('root')
)
