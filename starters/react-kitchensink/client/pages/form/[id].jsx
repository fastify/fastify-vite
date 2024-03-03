
import { useRouteContext } from '/:core.jsx'

export function getData ({ req, reply }) {
  if (req.method === 'POST') {
    if (req.body.number !== '42') {
      return reply.redirect('/')
    }
    return req.body
  } else {
    return {
      number: ''
    }
  }
}

export default function Form () {
  const { data } = useRouteContext()
  return (
    <>
      <h1>Form example with dynamic URL</h1>
      <form method="post">
        <label for="name">Magic number:</label>
        <br />
        <input type="text" id="number" name="number" defaultValue={data.number} />
        <br />
        <input type="submit" value="Submit" />
      </form>
    </>
  )
}
