import { useState } from 'react'
import { useIsomorphic, isServer } from 'fastify-vite-react/client'

export const path = '/'

export async function getData ({ $api }) {
  const msg = `hello from ${isServer ? 'server' : 'client'}`
  const { json } = await $api.echo({ msg })
  return json
}

export default function Home(props) {  
  let [msg, setMsg] = useState(null)

  // If first rendered on the server, just rehydrates on the client
  const ctx = useIsomorphic(getData)

  // Triggered by a button, does a fresh $api fetch()
  const fetchFromEcho = async () => {
    const { json } = await ctx.$api.echo({ msg: 'hello from client button' })
    setMsg(`${json.msg} ${count}`)
    setCount(count + 1)
  }

  let [count, setCount] = useState(0)

  // ctx.$loading is set automatically before and after await getData()
  if (ctx.$loading) {
    return (
      <div>
        <h1>Loading</h1>
      </div>
    )
  } else {
    return (
      <div>
        <h1>Home</h1>
        <p>Here's some data from the server: {JSON.stringify(ctx.$global)}</p>
        <button onClick={() => setCount(++count)}>count is: {count}</button>
        <button onClick={fetchFromEcho}>msg is: {msg || ctx.$data.msg}</button >
      </div>
    )
  }
}