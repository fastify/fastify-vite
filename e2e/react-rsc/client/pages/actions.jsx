export const rsc = true

import CounterForm from '../components/counter-form.jsx'

export default async function ActionsPage() {
  const { increment } = await import('../actions/increment.js')
  return (
    <article>
      <h1>RSC Server Actions</h1>
      <CounterForm incrementAction={increment} />
    </article>
  )
}

export function getMeta() {
  return { title: 'RSC Server Actions' }
}
