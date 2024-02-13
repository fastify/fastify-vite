import { Suspense } from '@kitajs/html/suspense.js'

export const path = '/suspense'

import Message from '/components/Message.jsx'

export const streaming = true

export default function ({ rid }) {
  return (
    <>
      <Suspense
        rid={rid}
        fallback={<div>Loading message...</div>}>
        <Message />
      </Suspense>
      <p>
        <a href="/">Go back to the index</a>
      </p>
    </>
  )
}
