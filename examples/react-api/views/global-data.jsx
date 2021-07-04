import { useHydration } from 'fastify-vite-react/client'

export const path = '/global-data'

export default function GlobalDataView (props) {
  const ctx = useHydration()
  return (
    <>
      <h1>Accessing Global Data from the Server</h1>
      <p>{JSON.stringify(ctx.$global)}</p>
    </>
  )
}
