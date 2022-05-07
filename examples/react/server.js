import Fastify from 'fastify'
import FastifyVite from 'fastify-vite'
import { dirname } from 'path'
import { renderToString } from 'react-dom/server'
import { createElement } from 'react'
import devalue from 'devalue'

const app = Fastify()

app.decorate('todoList', [
  'Do laundry',
  'Respond to emails',
  'Write report',
])

await app.register(FastifyVite, {
  dev: process.argv.includes('--dev'),
  configRoot: dirname(new URL(import.meta.url).pathname),
  serverEntryPoint: '/entry/server.jsx',
  clientEntryPoint: '/entry/client.jsx',
  createRenderFunction (createApp, { Context }) {
    return async function render (server, req, reply, url, options) {
      const data = { todoList: server.todoList }
      const app = createApp({ server, data, req, reply })
      const element = renderToString(
        createElement(Context.Provider, {
          value: app.ctx,
        }, createElement(app.Router, {
          location: url,
        }, app.Element(app.routes))),
      )
      return { hydration: devalue(app.ctx.data), element }
    }
  },
})

app.setErrorHandler((err, req, reply) => {
  console.log(err)
  reply.send('check logs')
})

app.post('/add', (req, reply) => {
  app.todoList.push(req.body.item)
  reply.send(0)
})

await app.vite.ready()
await app.listen(3000)
