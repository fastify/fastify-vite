'use client'

import { useState } from 'react'
import { proxy } from 'valtio'
import { RouteContext } from '@fastify/react/client'

export default function ValtioHydrator({ state, children }) {
  const [valtioProxy] = useState(() => proxy(state || {}))
  return <RouteContext.Provider value={{ state: valtioProxy }}>{children}</RouteContext.Provider>
}
