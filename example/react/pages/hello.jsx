import { useState, useEffect } from 'react'
import { useServerData } from 'fastify-vite/react'

export default function Hello(props) {
  let [msg, setMsg] = useState(props.$data?.message);

  let data, dataPath;
  if (props) {
    [data, dataPath] = useServerData(props)
  }

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