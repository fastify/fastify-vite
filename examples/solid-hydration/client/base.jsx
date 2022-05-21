import { Router } from 'solid-app-router'
export function createApp () {
  return App
}

function App () {
  return (
    <Router>
      <p>Hello world from Solid and fastify-vite!</p>
    </Router>
  )
}
