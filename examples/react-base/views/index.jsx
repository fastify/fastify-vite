import { Link } from 'react-router-dom'
import { useFastify } from 'fastify-vite-react/server'

export const path = '/'

export default function Index () {
  const fastify = useFastify()
  console.log(fastify)
  return (
    <>
      <h1>Index Page</h1>
      <p>Go to <Link to="/about">/about</Link></p>
    </>
  )
}
