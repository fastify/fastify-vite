import { useHydration } from 'fastify-vite-react/client'

export const path = '/about'

export default function GlobalData (props) {
  const [ctx] = useHydration()
  return (
    <>
      <h2>About</h2>
    </>
  )
}
