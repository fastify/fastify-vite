import { useState, useEffect } from 'react'
import { useServerData } from 'fastify-vite/react/hooks'

export default function Hello() {
  let [msg, setMsg] = useState();
  const [data, dataPath] = useServerData()
  // TODO: figure out similar component in react
  // const state = reactive({ message: data?.message })

  const refreshData = async () => {
    const response = await fetch(dataPath)
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