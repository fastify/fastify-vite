import { useState } from 'react'
import { useSSEContext, useServerData, useServerAPI } from 'fastify-vite/react'

export default function Home(props) {
  let [count, setCount] = useState(0)

  const { context } = useSSEContext()
  const $api = useServerAPI();
  const data = useServerData(() => {
    return context.$api.echo({ msg: '1' }).then(({ json }) => json)
  });
  let [msg, setMsg] = useState(data?.msg || '');

  const fetchFromEcho = async () => {
    const { json } = await $api.echo({ msg: `hello from client -> ` });

    setMsg(json.msg)
  }

  return (
    <div>
      <h1>Home</h1>
      <p>Here's some data from the server: {props.$global}</p>
      <button onClick={() => { console.log('hit'); setCount(++count) }}>count is: {count}</button>
      <button onClick={fetchFromEcho} > msg is: {msg}</button >
    </div>
  )
}

