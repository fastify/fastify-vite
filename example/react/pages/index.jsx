import { useState } from 'react'
import { useServerAPI, useServerData } from 'fastify-vite/vue/hooks'

export default function Home() {
  const [count, setCount] = useState(0);
  const [msg, setMsg] = useState(0);
  const api = useServerAPI()
  // const data = await useServerData(async () => {
  //   const { json } = await api.echo({ msg: 'hello from server ' })
  //   return json
  // })
  const fetchFromEcho = async () => {
    const { json } = await api.echo({ msg: 'hello from client ' })
    setMsg(json.msg)
  }
  return (
    <div>
      <h1>Home</h1>
      <p>Here's some sda asda from the server: {{ $global }}</p>
      <button onClick={() => setCount(++count)}>count is: {count}</button>
      <button onClick={fetchFromEcho} > msg is: {{ msg }}</button >
    </div>
  )
}

