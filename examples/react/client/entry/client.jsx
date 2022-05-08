import { hydrateRoot } from 'react-dom/client'
import { createRouter } from './app.jsx'

hydrateRoot(
  document.querySelector('main'),
  // No need to pass url as second parameter
  // here since BrowserRouter is used on the client
  createRouter(window.routeState)
)
