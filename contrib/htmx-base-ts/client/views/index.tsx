import Header from '/components/Header.tsx'
import logo from '/assets/logo.svg'

export const path = '/'

export const head = <>
  <title>Welcome to @fastify/htmx!</title>
</>

export default function () {
  const message = 'Welcome to @fastify/htmx!'
  return (
    <>
      <Header text={message} />
      <p><img src={logo} /></p>
    </>
  )
}
