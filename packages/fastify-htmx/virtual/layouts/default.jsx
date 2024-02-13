import { Suspense } from '@kitajs/html/suspense.js'
// This file serves as a placeholder if no layout.jsx file is provided

export default function Layout ({ app, req, reply, children }) {
  return (
    <Suspense>
      {children}
    </Suspense>
  )
}
