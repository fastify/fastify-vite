export const rsc = true

export default async function UsingData() {
  // Simulate server-side data fetching
  const data = await new Promise((resolve) =>
    setTimeout(() => resolve({ items: ['Item A', 'Item B', 'Item C'] }), 10),
  )
  return (
    <>
      <h2>Data Fetching in RSC</h2>
      <ul>
        {data.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </>
  )
}

export function getMeta() {
  return { title: 'Using Data' }
}
