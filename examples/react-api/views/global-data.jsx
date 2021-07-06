import { useHydration } from 'fastify-vite-react/client'

export const path = '/global-data'

export default function GlobalData (props) {
  const ctx = useHydration()
  return (
    <>
      <h2>Accessing Global Data from the Server</h2>
      <p>{JSON.stringify(ctx.$global)}</p>
    </>
  )
}
