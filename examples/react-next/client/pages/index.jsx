import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAtom } from 'jotai'
import { todoList } from '/state.js'

export default function Index (props) {
  return (
    <>
      <p>
        <Link to="/other">Go to /other</Link>
      </p>
      <p>
        <Link to="/items">Go to /items</Link>
      </p>
      <p>
        <Link to="/items/nested">Go to /items/nested</Link>
      </p>
    </>
  )
}
