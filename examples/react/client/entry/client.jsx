import { hydrateRoot } from 'react-dom/client'
import { createApp } from './app.jsx'
import Context from './context.js'

const { Element, Router, routes } = createApp()

hydrateRoot(
  document.querySelector('main'),
  <Context.Provider value={window.hydration}>  
    <Router>
      {Element(routes)}
    </Router>
  </Context.Provider>
)
