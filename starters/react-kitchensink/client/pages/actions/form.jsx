import { Link } from 'react-router-dom'
import { createServerAction } from '/:core.jsx'

const isAdmin = createServerAction()

export function configure (server) {
  server.post(isAdmin, async (req, reply) => {
    await new Promise((resolve, reject) => {
      setTimeout(resolve, 1000)
    })
    const username = req.body.username
    if (username === 'admin') {
      return reply.redirect('/admin')
    }
    return new Error('Invalid username')
  })
}

export default function Form () {
  return (
    <>
      <h1>Using inline server POST handler</h1>
      <form action={isAdmin} method="post">
        <label htmlFor="username">Username:</label>
        <input type="text" name="username" />
        <input type="submit" value="submit" />
      </form>
      <p>
        <Link to="/">Go back to the index</Link>
      </p>
    </>
  )
}
