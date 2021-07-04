import { useState, useEffect } from 'react'
import { useHydration } from 'fastify-vite-react/client'

export const path = '/hello'

export default function Hello () {
  const ctx = useHydration()
  const [msg, setMsg] = useState(null)
  const refreshData = async () => {
    const response = await fetch(ctx.$dataPath())
    const json = await response.json()
    setMsg(json.message)
  }
  return <h1 onClick={refreshData}>{msg || ctx.$data.message}</h1>
}
