import React from 'react'
import { Link } from 'react-router-dom'

export async function getServerSideProps ({ req, ky }) {
  const todoList = await ky('api/todo-list').json()
  return { item: todoList[req.params.id] }
}

export default function NestedItem ({ item }) {
  return (
    <>
      <p>{ item }</p>
      <p>
        <Link to="/">Go to the index</Link>
      </p>
    </>
  )
}
