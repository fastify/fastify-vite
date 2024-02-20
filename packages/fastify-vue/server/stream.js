
// Helper function to prepend and append chunks the body stream
export async function * generateHtmlStream ({ head, body, stream, footer }) {
  for await (const chunk of await head) {
    yield chunk
  }
  if (stream) {
    for await (const chunk of await stream) {
      yield chunk
    }
  } else {
    yield body
  }
  for await (const chunk of await footer()) {
    yield chunk
  }
}
