import { useContext, createSignal, For } from 'solid-js'
import ky from 'ky-universal'
import Context from '/entry/context.js'

export default function Index (props) {
	let input
  const { todoList: raw } = import.meta.env.SSR
    ? useContext(Context).data
    : window.hydration
  const [todoList, setTodoList] = createSignal(raw)
  const addItem = async () => {
    const json = { item: input.value }
    await ky.post('/add', { json }).json()
    setTodoList(list => [...list, input.value])
    input.value = ''
  }
  return (
    <>
      <ul>
      	<For each={todoList}>{(item) => <li>{item}</li>}</For>
      </ul>
      <input ref={input} />
      <button onClick={addItem}>Add</button>
    </>
  )
}
