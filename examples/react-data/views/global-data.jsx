import React from 'react'
import { useHydration } from 'fastify-vite-react/client.mjs'

export const path = '/global-data'

export default function GlobalData (props) {
  const [ctx] = useHydration()
  return (
    <>
      <h2>Accessing global data from the server</h2>
      <p>{JSON.stringify(ctx.$global)}</p>
    </>
  )
}
