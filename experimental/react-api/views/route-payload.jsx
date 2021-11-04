import { useState } from 'react'
import { useHydration } from 'fastify-vite-react/client'

export const path = '/route-payload'

export async function getPayload ({ req }) {
  // Simulate a long running request
  await new Promise((resolve) => setTimeout(resolve, 3000))

  return {
    message: req?.query?.message || 'Hello from server',
  }
}

export default function RoutePayload () {
  const [ctx, update] = useHydration({ getPayload })
  const [message, setMessage] = useState(null)

  // Example of manually using ctx.$payloadPath()
  // to construct a new request to this page's automatic payload API
  async function refreshPayload () {
    update({ $loading: true })
    const response = await window.fetch(`${
      ctx.$payloadPath()
    }?message=${
      encodeURIComponent('Hello from client')
    }`)
    const json = await response.json()
    setMessage(json.message)
    update({ $loading: false })
  }
  if (ctx.$loading) {
    return (
      <>
        <h2>Automatic route payload endpoint</h2>
        <p>Loading...</p>
      </>
    )
  }
  return (
    <>
      <h2>Automatic route payload endpoint</h2>
      <p>Message: {message || ctx.$payload?.message}</p>
      <button onClick={refreshPayload}>
        Click to refresh payload from server
      </button>
    </>
  )
}
