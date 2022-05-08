import { hydrateRoot } from 'react-dom/client'
import createApp from './app.jsx'
import { RouteContextProvider } from './context.jsx'

const { Element, Router, routes } = createApp()

hydrateRoot(
  document.querySelector('main'),
  <Router>
    <RouteContextProvider ctx={window.routeContext}>
      <Element routes={routes} />
    </RouteContextProvider>
  </Router>,
)
