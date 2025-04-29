export const path = '/form/:id'
export const method = ['GET', 'POST']

// For convenience, you can export a list of properties to decorate
// the Request object with. This is important to avoid changing the
// v8 shape of the object in runtime, which can hurt performance.
// Every property exported in `decorateRequest` is translated as
// `fastify.decorateRequest(prop, null)` at boot time.
export const decorateRequest = ['data']

// We could just run this function inside the default function export
// if it weren't for reply.redirect(). When the default function export
// is executed, it'll start streaming the HTTP headers and body immediately,
// making it impossible to call reply.redirect() in the process.
// By exporting preHandler, @fastify/htmx will register it
// as a Fastify route preHandler hook, so we can be sure it runs
// before the main view component function (default export).
export async function preHandler (req, reply) {
  req.data = {}
  if (req.method === 'POST') {
    if (req.body.number !== '42') {
      return reply.redirect('/')
    }
    req.data.number = req.body.number
  } else {
    req.data.number = ''
  }
}

export default function ({ req: { data } }) {
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
