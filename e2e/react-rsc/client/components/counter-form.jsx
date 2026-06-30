'use client'

import { useActionState } from 'react'

export default function CounterForm({ incrementAction }) {
  const [result, formAction, isPending] = useActionState(incrementAction, { count: 0 })

  return (
    <form action={formAction}>
      <p>
        Server count: <output>{result.count}</output>
      </p>
      <button type="submit" disabled={isPending}>
        {isPending ? 'Incrementing...' : 'Increment'}
      </button>
    </form>
  )
}
