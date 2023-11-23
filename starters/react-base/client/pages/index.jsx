import logo from '/assets/logo.svg'

export function getMeta () {
  return {
    title: 'Welcome to @fastify/react!'
  }
}

export default function Index () {
  const message = 'Welcome to @fastify/react!'
  return (
    <>
      <p>{message}</p>
      <img src={logo} />
    </p>
  )
}
