
export const path = '/list/add'
export const method = 'POST'

export default (app, req) => {
  app.db.todoList.push(req.body.inputValue)
  reply.header('XR-Redirect', req.headers.referer)
  return <li>{req.body.inputValue}</li>
}
