import logo from '/assets/logo.svg'
import { Link } from 'react-router-dom'
import Examples from '/comp/examples.jsx'
import { useRouteContext } from '@fastify/react/client'

export function getMeta () xa{
  return {
    title: 'Welcome to @fastify/react!'
  }
}

export default function Index () {
  const { snapshot, state } = useRouteContext()
  if (import.meta.env.SSR) {
    // State is automatically hydrated on the client
    state.message = 'Welcome to @fastify/react!'
  }
  return (
    <>
      <img src={logo} />
      <h1>{snapshot.message}</h1>
      <Examples />
    </>
  )
}
