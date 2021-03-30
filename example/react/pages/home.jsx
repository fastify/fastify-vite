import { useState } from 'react'
import { useServerAPI } from 'fastify-vite/react/hooks'

export default function Home() {
  let [count, setCount] = useState(0);
  let [msg, setMsg] = useState('');
  const $api = useServerAPI();

  const fetchFromEcho = async () => {
    const { json } = await $api.echo({ msg: 'hello from client -> ' })
    setMsg(json.msg)
  }
  return (
    <div>
      <h1>Home</h1>
      {/* <p>Here's some data from the server: {window}</p> */}
      <button onClick={() => setCount(++count)}>count is: {count}</button>
      <button onClick={fetchFromEcho} > msg is: {msg}</button >
    </div>
  )
}

