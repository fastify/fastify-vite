import { Link } from '@solidjs/router'
import { For } from 'solid-js'

export default function Index (props) {
  let input
  // eslint-disable-next-line solid/reactivity
  const [{ todoList }, { addItem }] = props.state
  return (
    <>
      <ul>
        <For each={todoList()}>{(item, i) =>
          <li>{item}</li>
        }</For>
      </ul>
      <div>
        <input ref={input} />
        <button onClick={() => {
          addItem(input.value)
          input.value = ''
        }}>Add</button>
      </div>
      <p>
        <Link href="/other">Go to another page</Link>
      </p>
    </>
  )
}
