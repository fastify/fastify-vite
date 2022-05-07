import { hydrate } from 'solid-js/web'
import createApp from './app.jsx'
import Context from './context.js'

const { Element, Router, routes } = createApp()

hydrate(
  <Context.Provider context={window.hydration}>  
    <Router>
      <Element routes={routes} />
    </Router>
  </Context.Provider>,
  document.querySelector('main'),  
)
