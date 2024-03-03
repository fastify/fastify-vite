import { useState } from 'react'
import { Link } from 'react-router-dom'
import { createServerAction, useServerAction } from '/:core.jsx'

const accessCounter = createServerAction()

export function configure (server) {
  let counter = 0
  server.get(accessCounter, (_, reply) => {
  	reply.send({ counter: ++counter })
  })
}

export default function Form () {
  const data = useServerAction(accessCounter)
  const [counter, setCounter] = useState(data.counter)
  const incrementCounter = async () => {
  	const request = await fetch(accessCounter)
  	const data = await request.json(0)
  	setCounter(data.counter)
  }
  return (
    <>
      <h1>Counter example using server action:</h1>
      <p>
        <Link to="/">Go back to the index</Link>
      </p>      
      <p>Counter: {counter}</p>
      <input type="button" value="Increment" onClick={incrementCounter} />
    </>
  )
}
