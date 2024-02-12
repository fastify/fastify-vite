import logo from '/assets/logo.svg'

export const head = <>
  <title>Welcome to @fastify/htmx!</title>
</>

export default function () {
  const message = 'Welcome to @fastify/htmx!'
  return (
    <>
      <h1>{ message }</h1>
      <p><img src={logo} /></p>
      <ul class="columns-2">
        <li><a href="/using-data">/using-data</a> demonstrates how to 
        leverage the <code>getData()</code> function 
        and <code>useRouteContext()</code> to retrieve server data for a route.</li>
        <li><a href="/using-store">/using-store</a> demonstrates how to 
        retrieve server data and maintain it in the global state.</li>
        <li><a href="/using-auth">/using-auth</a> demonstrates how to 
        wrap a route in a custom layout component.</li>
        <li><a href="/form/123">/form/123</a> demonstrates how to 
        send a POST request with form data to a route with dynamic URL.</li>
        <li><a href="/client-only">/client-only</a> demonstrates how to set 
        up a route for rendering on the client only (disables SSR).</li>
        <li><a href="/server-only">/server-only</a> demonstrates how to set 
        up a route for rendering on the server only (sends no JavaScript).</li>
        <li><a href="/streaming">/streaming</a> demonstrates how to set 
        up a route for SSR in streaming mode.</li>
      </ul>
    </>
  )
}
