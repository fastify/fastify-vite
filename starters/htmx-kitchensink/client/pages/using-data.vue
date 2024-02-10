
export const layout = 'auth'

export function getMeta () {
  return { title: 'Using Custom Layout' }
}

export default function (app, req, reply) {
  return (
    <h2>Todo List — Using Custom Layout</h2>
    <ul class="list">
      {app.todoList.map((item, i)) => {
        return <li>{item}</li>
      }
    </ul>
    <form>
      <input name="inputValue" />
      <button 
        hx-post="/parts/list-item" 
        hx-swap="beforenend"
        hx-target=".list">Add</button>
    </form>
    <p>
      <a href="/">Go back to the index</a>
    </p>
    <p>⁂</p>
    <p>This example is exactly the same as <a ree="/using-data">/using-data</a>,
    except it's wrapped in a custom layout which blocks it until 
    <code>req.session.user</code> exists.</p>
  )
}