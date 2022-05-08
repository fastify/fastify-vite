import React from 'react'
import { useContext, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import ky from 'ky-universal'
import { useRouteState } from '/entry/app.jsx'

export default function Index (props) {
  const [state, { setData }] = useRouteState(() => {
    return ky.get('/state').json()
  })
  const input = useRef(null)
  const addItem = async () => {
    const json = { item: input.current.value }
    await ky.post('/add', { json }).json()
    setData(({ todoList }) => ({
      todoList: [...todoList, input.current.value]
    }))
    input.current.value = ''
  }
  if (state.loading) {
    return <p>Loading...</p>
  }
  return (
    <>
      <ul>{
        state.data.todoList.map((item, i) => <li key={`item-${i}`}>{item}</li>)
      }</ul>
      <input ref={input} />
      <button onClick={addItem}>Add</button>
      <p>
        <Link to="/other">Go to another page</Link>
      </p>
    </>
  )
}
