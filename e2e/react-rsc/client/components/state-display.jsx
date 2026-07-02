'use client'

import { useRouteContext } from '@fastify/react/client'

export default function StateDisplay() {
  const { snapshot } = useRouteContext()
  return (
    <div className="valtio-state">
      <p data-testid="valtio-count">Count: {snapshot.count}</p>
      <p data-testid="valtio-message">Message: {snapshot.message}</p>
    </div>
  )
}
