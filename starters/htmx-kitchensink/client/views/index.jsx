
export const path = '/'

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
        <li><a href="/data">/data</a>: fetch data with async component.</li>
        <li><a href="/layout">/layout</a> rendering with named layout.</li>
        <li><a href="/css-module">/css-module</a>: rendering with css modules.</li>
        <li><a href="/form/123">/form/123</a> handle POST request and dynamic params.</li>
        <li><a href="/suspense">/suspense</a> loading fallbacks with <code>@kitajs/html/supense</code>.</li>
      </ul>
    </>
  )
}
