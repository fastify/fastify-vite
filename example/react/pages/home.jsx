import { useState, useContext } from 'react'
import { useServerData } from 'fastify-vite/react'

import { Context } from '../context'

export default function Home(props) {
  let [count, setCount] = useState(0);

  const { context } = useContext(Context);
  console.log(context)
  const data = ''
  console.log(useServerData(useContext(Context), () => {
    return context.$api.echo({ msg: 'hello from server '}).then(({json}) => json.msg)
  }))
  // console.log(ddd)

  let [msg, setMsg] = useState(data);

  const fetchFromEcho = async () => {
    const { json } = await context.$api.echo({ msg: `hello from client -> ` });

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

