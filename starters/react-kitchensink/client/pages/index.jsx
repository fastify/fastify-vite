import logo from '/assets/logo.svg'
import { Link } from 'react-router-dom'
import { isServer, useRouteContext } from '/:core.jsx'

export function getMeta () {
  return {
    title: 'Welcome to @fastify/react!'
  }
}

export default function Index () {
  const { snapshot, state } = useRouteContext()
  if (isServer) {
    // State is automatically hydrated on the client
    state.message = 'Welcome to @fastify/react!'
  }
  return (
    <>
      <img src={logo} />
      <h1>{snapshot.message}</h1>
      <ul className="columns-2">
        <li><Link to="/using-data">/using-data</Link> demonstrates how to 
        leverage the <code>getData()</code> function 
        and <code>useRouteContext()</code> to retrieve server data for a route.</li>
        <li><Link to="/using-store">/using-store</Link> demonstrates how to 
        leverage the 
        automated <a href="https://github.com/pmndrs/valtio">Valtio</a> store 
        to retrieve server data for a route and maintain it in a global 
        state even after navigating to another route.</li>
        <li><Link to="/using-auth">/using-auth</Link> demonstrates how to 
        wrap a route in a custom layout component.</li>
        <li><Link to="/form/123">/form/123</Link> demonstrates how to 
    send a POST request with form data to a route with dynamic URL.</li>
        <li><Link to="/actions/data">/actions/data</Link> demonstrates using a server action.</li>
        <li><Link to="/actions/form">/actions/form</Link> demonstrates using a server action with form.</li>
        <li><Link to="/client-only">/client-only</Link> demonstrates how to set 
        up a route for rendering on the client only (disables SSR).</li>
        <li><Link to="/server-only">/server-only</Link> demonstrates how to set 
        up a route for rendering on the server only (sends no JavaScript).</li>
        <li><Link to="/streaming">/streaming</Link> demonstrates how to set 
        up a route for SSR in streaming mode.</li>
      </ul>
    </>
  )
}
