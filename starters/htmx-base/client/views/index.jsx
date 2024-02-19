
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
    </>
  )
}
