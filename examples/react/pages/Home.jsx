import { useState } from 'react'
import { useIsomorphic } from 'fastify-vite-react/client'

export const path = '/'

export async function getData ({ $api }) {
  const msg = `hello from client`
  const { json } = await $api.echo({ msg })
  return json
}

export default function Home(props) {  
  // If first rendered on the server, just rehydrates on the client
  // If first rendered on the client, does a fresh $api fetch()
  const ctx = useIsomorphic(getData, (json) => {
    setMsg(json.msg)
  })

  let [msg, setMsg] = useState(ctx.$data.msg)

  // Triggered by a button, does a fresh $api fetch()
  const fetchFromEcho = async () => {
    const { json } = await ctx.$api.echo({
      msg: `hello from client`
    })
    setMsg(`${json.msg} ${count}`)
    setCount(count + 1)
  }

  let [count, setCount] = useState(0)

  // ctx.$loading is set automatically before and after await getData()
  if (ctx.$loading) {
    <div>
      <h1>Loading</h1>
    </div>
  } else {
    return (
      <div>
        <h1>Home</h1>
        <p>Here's some data from the server: {ctx.$global}</p>
        <button onClick={() => setCount(++count)}>count is: {count}</button>
        <button onClick={fetchFromEcho}>msg is: {msg}</button >
      </div>
    )
  }
}