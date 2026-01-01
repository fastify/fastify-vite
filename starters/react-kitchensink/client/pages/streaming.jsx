import { Suspense } from 'react'

export const streaming = true

export default function Index() {
  return (
    <Suspense fallback={<p>Waiting for content</p>}>
      <Message />
    </Suspense>
  )
}

function Message() {
  const message = afterSeconds({
    id: 'index',
    message: 'Delayed by Suspense API',
    seconds: 5,
  })
  return <p>{message}</p>
}

const delays = new Map()

function afterSeconds({ id, message, seconds }) {
  const delay = delays.get(id)
  if (delay) {
    if (delay.message) {
      delays.delete(id)
      return delay.message
    }
    if (delay.promise) {
      throw delay.promise
    }
  } else {
    delays.set(id, {
      message: null,
      promise: new Promise((resolve) => {
        setTimeout(() => {
          delays.get(id).message = message
          resolve()
        }, seconds * 1000)
      }),
    })
    return afterSeconds({ id, message })
  }
}
