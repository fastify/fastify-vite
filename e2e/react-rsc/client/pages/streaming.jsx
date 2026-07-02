import { Suspense } from 'react'

export const rsc = true

async function SlowComponent() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return <p>This loaded after 500ms (streamed)</p>
}

export default async function StreamingPage() {
  return (
    <section>
      <h2>Streaming SSR</h2>
      <p>This content renders immediately.</p>
      <Suspense fallback={<p>Loading slow content...</p>}>
        <SlowComponent />
      </Suspense>
    </section>
  )
}

export function getMeta() {
  return { title: 'Streaming' }
}
