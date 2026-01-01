import { Link } from 'react-router'

export default function Index() {
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
