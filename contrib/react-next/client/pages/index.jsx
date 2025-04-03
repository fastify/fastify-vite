import React from 'react'
import { Link } from 'react-router-dom'

export default function Index (props) {
  return (
    <>
      <p>
        <Link to="/items">Go to /items</Link>
      </p>
      <p>
        <Link to="/items/nested">Go to /items/nested</Link>
      </p>
    </>
  )
}
