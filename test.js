'use strict'

const tap = require('tap')

const exampleServer = require('./example/server')

exampleServer().then(async (fastify) => {
  let indexPage
  let helloPage

  await fastify.ready()

  tap.tearDown(() => {
    fastify.close()
    process.exit()
  })

  tap.test('should start server and serve index page', async (t) => {
    t.plan(2)
    indexPage = await fastify.inject({ url: '/' })
    t.equal(indexPage.statusCode, 200)
    t.match(indexPage.body, /^<!DOCTYPE html>/)
  })

  tap.test('served index page should have correct client entry path', async (t) => {
    t.plan(1)
    t.ok(hasCorrectClientEntryPath(fastify, indexPage.body))
  })

  tap.test('served hello page should have ssrData with matching ssrDataKey', async (t) => {
    t.plan(1)
    helloPage = await fastify.inject({ url: '/hello' })
    t.ok(helloPage.body.includes(`Symbol.for('${fastify.vite.config.dataKey}')`))
  })
})

function hasCorrectClientEntryPath (server, html) {
  return html.includes(`<script type="module" src="${server.vite.config.clientEntryPath}"></script>`)
}
