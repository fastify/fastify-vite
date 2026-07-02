import test from 'node:test'
import assert from 'node:assert/strict'

test('convertRequest creates valid Fetch Request from Fastify req', async () => {
  const { convertRequest } = await import('./rsc-handler.js')
  const mockReq = {
    url: '/blog/hello',
    method: 'GET',
    headers: { host: 'localhost:4000', accept: 'text/html' },
    protocol: 'http',
    hostname: 'localhost',
  }
  const request = await convertRequest(mockReq)
  assert.equal(request.method, 'GET')
  assert.equal(request.url, 'http://localhost:4000/blog/hello')
  assert.equal(request.headers.get('accept'), 'text/html')
})

test('convertRequest handles POST with body', async () => {
  const { convertRequest } = await import('./rsc-handler.js')
  const body = { title: 'test' }
  const mockReq = {
    url: '/action',
    method: 'POST',
    headers: { host: 'localhost:4000', 'content-type': 'application/json' },
    protocol: 'http',
    hostname: 'localhost',
    body: body,
  }
  const request = await convertRequest(mockReq)
  assert.equal(request.method, 'POST')
  const responseBody = await request.json()
  assert.deepEqual(responseBody, body)
})

test('sendResponse copies status and headers to reply', async () => {
  const { sendResponse } = await import('./rsc-handler.js')
  let status, headers, body
  const mockReply = {
    code: (s) => {
      status = s
      return mockReply
    },
    header: (k, v) => {
      headers = { ...headers, [k]: v }
    },
    send: (b) => {
      body = b
    },
  }
  const response = new Response('ok', {
    status: 200,
    headers: { 'content-type': 'text/html' },
  })
  await sendResponse(mockReply, response)
  assert.equal(status, 200)
  assert.equal(headers['content-type'], 'text/html')
  assert.ok(body)
})
