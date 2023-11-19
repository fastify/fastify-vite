
// Helper function to prepend and append chunks the body stream
export async function * generateHtmlStream ({ head, body, stream, footer }) {
  yield head
  if (body) {
    yield body
  }
  if (stream) {
    for await (const chunk of await stream) {
      yield chunk
    }
  }
  yield footer()
}
