import { Link } from 'react-router-dom'
import { createServerAction, useServerAction } from '/:core.jsx'

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
      <h1>Form example using server endpoint:</h1>
      <form action={isAdmin} method="post">
        <label for="username">Username:</label>
        <input type="text" name="username" />
        <input type="submit" value="submit" />
      </form>
    </>
  )
}
