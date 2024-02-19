export const path = '/form/:id'
export const method = ['GET', 'POST']

export default function ({ app, req, reply }) {
  const data = {}
  if (req.method === 'POST') {
    if (req.body.number !== '42') {
      return reply.redirect('/')
    }
    data.number = req.body.number
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
      <p>
        <a href="/">Go back to the index</a>
      </p>
      <p>⁂</p>
      <p>Submitting any value other than <code>42</code> will cause a redirect to the index page.</p>
      <p>This route will be rendered with any valid <code>id</code> fragment passed to <code>/form/:id</code>.</p>      
    </>
  )
}
