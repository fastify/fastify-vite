import { useState, useEffect } from 'react'
import { setupServerAPI } from 'fastify-vite/react/hydrate'

export default function Hello() {
  let [msg, setMsg] = useState('hello test');
  window.$api = window[key]
  const api = setupServerAPI(window)
  // const api = useServerAPI()
  // const [data, dataPath] = useServerData()
  // const state = reactive({ message: data?.message })

  const refreshData = async () => {
    const response = await fetch(dataPath)
    const json = await response.json()
    setMsg(json.message)
  }

  // useEffect(() => {
  //   if (!data && !import.meta.env.SSR) {
  //     await refreshData();
  //   }
  // })

  return <h1 onClick={refreshData}>{msg}</h1>

}