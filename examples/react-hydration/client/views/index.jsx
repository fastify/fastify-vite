import { useRef } from 'react'
import { Link } from 'react-router'
import { useAtom } from 'jotai'
import { todoList } from '../state.js'

export default function Index() {
  const [state, updateState] = useAtom(todoList)
  const input = useRef(null)
  const addItem = async () => {
    updateState((todoList) => {
      return [...todoList, input.current.value]
    })
    input.current.value = ''
  }
  return (
    <>
      <ul>
        {state.map((item, i) => {
          return <li key={`item-${i}`}>{item}</li>
        })}
      </ul>
      <div>
        <input ref={input} />
        <button onClick={addItem}>Add</button>
      </div>
      <p>
        <Link to="/other">Go to another page</Link>
      </p>
    </>
  )
}
