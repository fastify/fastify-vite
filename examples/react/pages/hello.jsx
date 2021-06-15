import { useState, useEffect } from 'react'
import { useSSEContext } from 'fastify-vite-react/client'

export default function Hello () {
  const { context, setContext } = useSSEContext()
  const [msg, setMsg] = useState(context?.$data?.message)

  const refreshData = async () => {
    const response = await fetch(context.$dataPath())
    const json = await response.json()
    setMsg(json.message)
  }

  useEffect(() => {
    if (!msg && !import.meta.env.SSR) {
      refreshData()
    }
  })

  return <h1 onClick={refreshData}>{msg}</h1>
}
