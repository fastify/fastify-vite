export async function convertRequest(req) {
  const host = req.headers?.host ?? req.hostname
  const url = new URL(req.url, `${req.protocol}://${host}`)
  const init = {
    method: req.method,
    headers: new Headers(req.headers),
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const contentType = req.headers?.['content-type'] || ''
    if (contentType.startsWith('multipart/form-data')) {
      // Pass raw stream — RSC handler calls request.formData().
      // @fastify/multipart runs without attachFieldsToBody, so the body
      // remains on req.raw.
      init.body = req.raw
      init.duplex = 'half'
    } else if (req.body) {
      const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
      init.body = body
    }
  }
  const request = new Request(url, init)
  request.__valtioState = req.route?.state ?? null
  request.__server = req.route?.server ?? null
  request.__req = req
  return request
}

export async function sendResponse(reply, response) {
  reply.code(response.status)
  for (const [key, value] of response.headers) {
    // Strip Content-Length for streaming responses — Fastify's
    // sendWebStream() handles framing via chunked transfer encoding.
    // react-router's routeRSCServerRequest sets Content-Length on RSC
    // payload responses, which would short-circuit the HTML stream.
    if (key.toLowerCase() === 'content-length' && response.body instanceof ReadableStream) {
      continue
    }
    reply.header(key, value)
  }
  if (response.body) {
    // Fastify 5.x natively streams Web ReadableStream via sendWebStream()
    reply.send(response.body)
  } else {
    reply.send()
  }
}
