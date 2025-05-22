import { Suspense } from 'react'

export default function Default ({ children }) {
  return (
    <Suspense>
      {children}
    </Suspense>
  )
}
