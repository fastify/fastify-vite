export const rsc = true

import { ServerDataButton } from '../components/server-data.jsx'

export default async function DataActionsPage() {
  return (
    <section>
      <h2>Data Server Action</h2>
      <p>Click the button to fetch data from a server action:</p>
      <ServerDataButton />
    </section>
  )
}

export function getMeta() {
  return { title: 'Data Action' }
}
