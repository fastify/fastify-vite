import { useState, useEffect } from 'react'

export default function Hello(props) {  
  let [msg, setMsg] = useState(props.$data?.message);

  const refreshData = async () => {
    const response = await fetch(props.$dataPath())
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