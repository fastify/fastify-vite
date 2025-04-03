import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAtom } from 'jotai'
import { todoList } from '../state.js'

export default function Index (props) {
  const [state, updateState] = useAtom(todoList)
  const [input, setInput] = useState(null)
  const addItem = async () => {
    updateState((todoList) => {
      return [...todoList, input.value]
    })
    input.value = ''
  }
  return (
    <>
      <ul>{
        state.map((item, i) => {
          return <li key={`item-${i}`}>{item}</li>
        })
      }</ul>
      <div>
        <input ref={setInput} />
        <button onClick={addItem}>Add</button>
      </div>
      <p>
        <Link to="/other">Go to another page</Link>
      </p>
    </>
  )
}
