
// Helper function to prepend and append chunks the body stream
export async function * generateHtmlStream ({ head, body, stream, footer }) {
  for await (const chunk of await head) {
    yield chunk
  }
  for await (const chunk of await body) {
    yield chunk
  }
  if (stream) {
    for await (const chunk of await stream) {
      yield chunk
    }
  }
  for await (const chunk of await footer) {
    yield chunk
  }
}
