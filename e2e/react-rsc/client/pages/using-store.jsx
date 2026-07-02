import StateDisplay from '../components/state-display.jsx'

export const rsc = true

export default async function UsingStore() {
  return (
    <section>
      <h2>Valtio State Management</h2>
      <p>
        State is seeded from server context.js, threaded through the RSC Flight protocol via
        ValtioHydrator, and displayed client-side.
      </p>
      <StateDisplay />
    </section>
  )
}

export function getMeta() {
  return { title: 'Using Store' }
}
