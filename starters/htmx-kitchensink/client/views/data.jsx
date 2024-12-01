
import './data.client.js'

export const path = '/data'

export const head = <>
  <title>Using Data</title>
</>

export default async function ({ app, req, reply }) {
  // Just to demonstrate an asynchronous request
  const data = await new Promise((resolve) => {
    // Prepopulated in server.js
    resolve(app.db.todoList)
  })
  return (
    <>
      <h2>Todo List — Using Data</h2>
      <ul class="list">
        {data.map((item, i) => {
          return <li>{item}</li>
        })}
      </ul>
      <form>
        <input name="inputValue" />
        <button
          id="add-button"
          hx-post="/list/add"
          hx-swap="beforeend"
          hx-target=".list">Add</button>
      </form>
      <p>
        <a href="/">Go back to the index</a>
      </p>
    </>
  )
}
