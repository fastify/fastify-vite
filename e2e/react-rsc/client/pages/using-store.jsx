export const rsc = true

export default async function UsingStore() {
  // The server context has already seeded the state
  // In a real app, a 'use client' component would call useRouteContext()
  return (
    <section>
      <h2>Valtio State Management</h2>
      <p>State is seeded from server context.js and hydrated client-side.</p>
    </section>
  )
}

export function getMeta() {
  return { title: 'Using Store' }
}
