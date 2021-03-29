import { useState, useEffect } from 'react'
import { useServerAPI, useServerData } from 'fastify-vite/react/hooks'

export default async function Hello() {
  const [msg, setMsg] = useState(0);
  const api = useServerAPI()
  const [data, dataPath] = await useServerData()
  const state = reactive({ message: data?.message })

  const refreshData = async () => {
    const response = await fetch(dataPath)
    const json = await response.json()
    setMsg(json.message)
  }

  useEffect(() => {
    if (!data && !import.meta.env.SSR) {
      await refreshData()
    }
  })

  return (
    <h1 onClick={refreshData}>{msg}</h1>
  )
}