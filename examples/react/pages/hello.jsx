import { useState, useEffect } from 'react'
import { useSSEContext } from 'fastify-vite/react'

export default function Hello() {
  const { context, setContext } = useSSEContext();
  let [msg, setMsg] = useState(context?.$data?.message);

  const refreshData = async () => {
    const response = await fetch(context.$dataPath())
    const json = await response.json()
    setMsg(json.message)
  }

  useEffect(() => {
    if (!msg && !import.meta.env.SSR) {
      refreshData();
    }
  })

  return <h1 onClick={refreshData}>{msg}</h1>

}