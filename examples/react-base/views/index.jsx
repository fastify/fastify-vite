import React from 'react'
import { Link } from 'react-router-dom'

export const path = '/'

export default function Index () {
  return (
    <>
      <h1>Index Page</h1>
      <p>Go to <Link to="/about">/about</Link></p>
    </>
  )
}
