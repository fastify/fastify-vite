import { useState, useEffect } from 'react'
import { hydrate } from 'fastify-vite/react/hydrate'

export default function Hello() {
  let [msg, setMsg] = useState();
  window.$api = window[key]
  const { $dataPath } = hydrate(window)
  // const api = useServerAPI()
  // const [data, dataPath] = useServerData()
  // const state = reactive({ message: data?.message })

  const refreshData = async () => {
    const response = await fetch($dataPath())
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