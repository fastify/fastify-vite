'use client'

import { useState, type ReactNode } from 'react'
import { proxy } from 'valtio'
import { RouteContext } from '@fastify/react/client'

interface ValtioHydratorProps {
  state: Record<string, unknown>
  children: ReactNode
}

export default function ValtioHydrator({ state, children }: ValtioHydratorProps) {
  const [valtioProxy] = useState(() => proxy(state ?? {}))
  return <RouteContext.Provider value={{ state: valtioProxy }}>{children}</RouteContext.Provider>
}
