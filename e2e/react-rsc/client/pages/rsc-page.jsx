export const rsc = true

export default async function RscPage() {
  return (
    <article>
      <h1>RSC Page</h1>
      <p>Server-rendered timestamp: {new Date().toISOString()}</p>
      <p>This content is rendered on the server.</p>
    </article>
  )
}

export function getMeta() {
  return {
    title: 'RSC Page',
    description: 'A server-rendered RSC page',
  }
}
