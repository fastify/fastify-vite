
export const path = '/list/add'
export const method = 'POST'

export default ({ app, req, reply }) => {
  app.db.todoList.push(req.body.inputValue)
  return <li>{req.body.inputValue}</li>
}
