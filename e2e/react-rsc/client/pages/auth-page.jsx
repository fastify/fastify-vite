export const rsc = true
export const layout = 'auth'

export default async function AuthenticatedPage() {
  return (
    <section>
      <h2>Authenticated Route</h2>
      <p>This route uses the auth layout wrapper.</p>
    </section>
  )
}

export function getMeta() {
  return { title: 'Authenticated' }
}
