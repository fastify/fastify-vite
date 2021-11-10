import React from 'react'
import { useHydration } from 'fastify-vite-react/client.mjs'

export const path = '/route-hooks'

export async function onRequest (req) {
  req.$data = { msg: 'hello from onRequest' }
}

export default function RouteHooks () {
  const [ctx] = useHydration()

  return (
    <>
      <h2>Registering Fastify route hooks via exports</h2>
      <p>{ ctx.$data ? ctx.$data.msg : 'Refresh (SSR) to get server data' }</p>
    </>
  )
}
