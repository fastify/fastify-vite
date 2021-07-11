import { useState } from 'react'
import { useHydration } from 'fastify-vite-react/client'

export const path = '/route-payload'

export async function getPayload ({ req }) {
  return {
    message: req?.query?.message || 'Hello from server',
  }
}

export default function RoutePayload () {
  const ctx = useHydration({ getPayload })
  const [message, setMessage] = useState(ctx.$payload?.message)
  async function refreshPayload () {
    const response = await window.fetch(`${
      ctx.$payloadPath()
    }?message=${
      encodeURIComponent('Hello from client')
    }`)
    const json = await response.json()
    setMessage(json.message)
  }
  return (
    <>
      <h2>Automatic route payload endpoint</h2>
      <p>Message: {message}</p>
      <button onClick={refreshPayload}>
        Click to refresh payload from server
      </button>
    </>
  )
}
