import React from 'react'
import { Link } from 'react-router-dom'

export default function Other () {
  return (
    <>
      <p>This page is just for demonstrating client-side navigation.</p>
      <Link to="/">Go back to index</Link>
    </>
  )
}
