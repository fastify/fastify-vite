import { useState } from 'react'

export default function Home(props) {
  let [count, setCount] = useState(0);
  let [msg, setMsg] = useState('');

  const fetchFromEcho = async () => {
    const { json } = await props.$api.echo({ msg: `hello from client -> ` })
    setMsg(json.msg)
  }
  return (
    <div>
      <h1>Home</h1>
      {/* <p>Here's some data from the server: {window}</p> */}
      <button onClick={() => { console.log('hit'); setCount(++count) }}>count is: {count}</button>
      <button onClick={fetchFromEcho} > msg is: {msg}</button >
    </div>
  )
}

