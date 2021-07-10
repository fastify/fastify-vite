import { useHydration } from 'fastify-vite-react/client'

export const path = '/data-fetching'

export async function getData ({ req, $api }) {
  return {
    message: isServer
      ? req.query?.message ?? 'Hello from server'
      : 'Hello from client',
    result: await $api.method({
      message: 'Hello from API method'
    }),
  }
}

export default function DataFetching (props) {
  const ctx = useHydration()
  if (ctx.$loading) {
    return (
      <>
        <h2>Isomorphic data fetching</h2>
        <p>Loading...</p>
      </>
    )
  }
  return (
    <>
      <h2>Isomorphic data fetching</h2>
      <p>{JSON.stringify(ctx.$data)}</p>
    </>
  )
}
