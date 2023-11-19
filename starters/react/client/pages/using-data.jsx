import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRouteContext } from '/dx:core.jsx'

export function getMeta () {
  return { title: 'Todo List — Using Data' }
}

export function getData ({ server }) {
	return {
		todoList: server.db.todoList
	}
}

export default function Index (props) {
  const {data} = useRouteContext()
  const [todoList, updateTodoList] = useState(data.todoList)
  const [input, setInput] = useState(null)
  const addItem = (value) => {
    updateTodoList(list => [...list, value])
    input.value = ''
  }
  return (
    <>
      <h2>Todo List — Using Data</h2>
      <ul>{
        todoList.map((item, i) => {
          return <li key={`item-${i}`}>{item}</li>
        })
      }</ul>
      <div>
        <input ref={setInput} />
        <button onClick={() => addItem(input.value)}>Add</button>
      </div>
      <p>
        <Link to="/">Go back to the index</Link>
      </p>
      <p>⁂</p>
      <p>When you navigate away from this route, any additions to the to-do 
      list will be lost, because they're bound to this route component only.</p>
      <p>See the <Link to="/using-store">/using-store</Link> example to learn 
      how to use the application global state for it.
      </p>
    </>
  )
}
