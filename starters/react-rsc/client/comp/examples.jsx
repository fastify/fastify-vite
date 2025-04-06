import { Link } from 'react-router-dom'

export default function Examples() {
  return (
    <ul className="columns-2">
      <li><Link to="/using-data">/using-data</Link> — isomorphic data fetching.</li>
      <li><Link to="/using-store">/using-store</Link> — integrated <a href="https://github.com/pmndrs/valtio">Valtio</a> store.</li>
      <li><Link to="/using-auth">/using-auth</Link> — <b>custom layout</b>.</li>
      <li><Link to="/form/123">/form/123</Link> — <code>POST</code> to dynamic route.</li>
      <li><Link to="/actions/data">/actions/data</Link> — inline <code>GET</code> handler.</li>
      <li><Link to="/actions/form">/actions/form</Link> — inline <code>POST</code> handler.</li>
      <li><Link to="/client-only">/client-only</Link> — <b>disabling</b> SSR.</li>
      <li><Link to="/server-only">/server-only</Link> — <code>0kb</code> JavaScript.</li>
      <li><Link to="/streaming">/streaming</Link> — <b>streaming</b> SSR.</li>
      <li><Link to="/wildcard/another/one">/wildcard/another/one</Link> — <b>wildcard route matching</b> <code>/wildcard/*</code></li>
    </ul>
  )
}
