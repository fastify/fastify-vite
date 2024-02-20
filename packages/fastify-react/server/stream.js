// Helper to make the stream returned renderToPipeableStream()
// behave like an event emitter and facilitate error handling in Fastify
import { Minipass } from 'minipass'

// React 18's preferred server-side rendering function,
// which enables the combination of React.lazy() and Suspense
import { renderToPipeableStream } from 'react-dom/server'

// Helper function to prepend and append chunks the body stream
export async function* generateHtmlStream({ head, body, footer }) {
  for await (const chunk of await head) {
    yield chunk
  }
  if (body) {
    for await (const chunk of await body) {
      yield chunk
    }
  }
  for await (const chunk of await footer()) {
    yield chunk
  }
}

// Helper function to get an AsyncIterable (via PassThrough)
// from the renderToPipeableStream() onShellReady event
export function onShellReady(app) {
  const duplex = new Minipass()
  return new Promise((resolve, reject) => {
    try {
      const pipeable = renderToPipeableStream(app, {
        onShellReady() {
          resolve(pipeable.pipe(duplex))
        },
      })
    } catch (error) {
      resolve(error)
    }
  })
}

// Helper function to get an AsyncIterable (via Minipass)
// from the renderToPipeableStream() onAllReady event
export function onAllReady(app) {
  const duplex = new Minipass()
  return new Promise((resolve, reject) => {
    try {
      const pipeable = renderToPipeableStream(app, {
        onAllReady() {
          resolve(pipeable.pipe(duplex))
        },
      })
    } catch (error) {
      resolve(error)
    }
  })
}
