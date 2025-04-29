import { Link } from 'react-router'

export async function getServerSideProps({ fetchJSON }) {
  return {
    todoList: await fetchJSON("/api/todo-list"),
  };
}

export default function ItemsIndex ({ todoList = [] }) {
  return (
    <>
      <ul>{
        todoList.map((item, i) => {
          return <li key={`item-${i}`}><Link to={`/items/${i}`}>{item}</Link></li>
        })
      }</ul>
      <p>
        <Link to="/">Go to the index</Link>
      </p>
    </>
  )
}
