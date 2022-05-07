import React from 'react'
import { useContext, useState, useRef } from 'react'
import ky from 'ky-universal'
import Context from '/entry/context.js'

export default function Index (props) {
  const { todoList: raw } = import.meta.env.SSR
    ? useContext(Context).data
    : window.hydration
  console.log('raw', raw)
  // const [todoList, setTodoList] = useState(raw)
  // const input = useRef(null)
  // const addItem = async () => {
  //   const json = { item: input.current.value }
  //   await ky.post('/add', { json }).json()
  //   setTodoList(list => [...list, input.current.value])
  //   input.current.value = ''
  // }
  return <p>Hello</p>
  // return (
  //   <>
  //     <ul>{
  //       todoList.map((item, i) => <li key={`item-${i}`}>{item}</li>)
  //     }</ul>
  //     <input ref={input} />
  //     <button onClick={addItem}>Add</button>
  //   </>
  // )
}
