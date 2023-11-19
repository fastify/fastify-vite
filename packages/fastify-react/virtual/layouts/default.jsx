// This file serves as a placeholder
// if no layout.jsx file is provided

import { Suspense } from 'react'

export default function Layout ({ children }) {
  return (
    <Suspense>
      {children}
    </Suspense>
  )
}
