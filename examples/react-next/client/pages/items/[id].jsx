import React from 'react'
import { Link } from 'react-router-dom'

export async function getServerSideProps ({ req, ky }) {
  throw new Error('This error was intentionally thrown')
  // eslint-disable-next-line no-unreachable
  const todoList = await ky('api/todo-list').json()
  return { item: todoList[req.params.id] }
}

export default function Item ({ item }) {
  return (
    <>
      <p>{ item }</p>
      <p>
        <Link to="/">Go to the index</Link>
      </p>
    </>
  )
}
