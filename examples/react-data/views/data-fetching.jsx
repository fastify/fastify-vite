import React from 'react'
import { useHydration, isServer } from 'fastify-vite-react/client.mjs'

export const path = '/data-fetching'

export async function getData ({ req, fetch }) {
  return {
    message: isServer
      ? req.query?.message ?? 'Hello from server'
      : 'Hello from client',
    result: await fetch('https://httpbin.org/json').then(r => r.json()),
  }
}

export default function DataFetching (props) {
  const [ctx] = useHydration({ getData })
  if (ctx.$loading) {
    return (
      <>
        <h2>Isomorphic data fetching</h2>
        <p>Loading...</p>
      </>
    )
  }
  return (
    <>
      <h2>Isomorphic data fetching</h2>
      <p>{JSON.stringify(ctx.$data)}</p>
    </>
  )
}
