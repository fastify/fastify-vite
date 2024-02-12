export const path = '/form/:id'

export default function (app, req, reply) {
  const data = {}
  if (req.method === 'POST') {
    if (req.body.number !== '42') {
      return reply.redirect('/')
    }
    data.number = req.body
  } else {
    data.number = ''
  }
  return (
    <>
      <h1>Form example with dynamic URL</h1>
      <form method="post">
        <label for="name">Magic number:</label>
        <br />
        <input type="text" id="number" name="number" value={data.number} />
        <br />
        <input type="submit" value="Submit" />
      </form>
    </>
  )
}
