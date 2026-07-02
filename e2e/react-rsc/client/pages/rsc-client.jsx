import Counter from '../components/counter.jsx'

export const rsc = true

export default async function RscClientPage() {
  return (
    <article>
      <h1>RSC Client Component Demo</h1>
      <p>Below is a &apos;use client&apos; interactive component rendered inside an RSC page:</p>
      <Counter />
    </article>
  )
}

export function getMeta() {
  return {
    title: 'RSC Client Demo',
  }
}
