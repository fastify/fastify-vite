import { useState } from 'react'
import { Link } from 'react-router-dom'
import { createServerAction, useServerAction } from '$app/core.jsx'

const accessCounter = createServerAction()

export function configure (server) {
  let counter = 0
  server.get(accessCounter, (_, reply) => {
  	reply.send({ counter: ++counter })
  })
}

export default function Form () {
  // useServerAction(endpoint) acts a React suspense resource,
  // with the exception that data is retrieved only once per
  // route and cleared only when the user navigates to another route.
  const data = useServerAction(accessCounter)
  const [counter, setCounter] = useState(data.counter)

  // Just use endpoint string to retrieve fresh data on-demand
  const incrementCounter = async () => {
  	const request = await fetch(accessCounter)
  	const data = await request.json(0)
  	setCounter(data.counter)
  }

  return (
    <>
      <h1>Using inline server GET handler</h1>
      <p><code>useServerAction(endpoint)</code> acts a React Suspense resource,
        with the exception that data is retrieved only once per
        route and cleared only when the user navigates to another route.</p>
      <p>Counter: {counter}</p>
      <input type="button" value="Increment" onClick={incrementCounter} />
      <p>
        <Link to="/">Go back to the index</Link>
      </p>
    </>
  )
}
