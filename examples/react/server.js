import { setTimeout } from 'timers/promises'
import { dirname } from 'path'
import Fastify from 'fastify'
import FastifyVite from 'fastify-vite'
import { renderToString } from 'react-dom/server'
import { createElement } from 'react'
import devalue from 'devalue'

const app = Fastify()

app.decorate('todoList', [
  'Do laundry',
  'Respond to emails',
  'Write report',
])

app.get('/data', async (_, reply) => {
  await setTimeout(1500)
  reply.send({ todoList: app.todoList })
})

await app.register(FastifyVite, {
  dev: process.argv.includes('--dev'),
  configRoot: dirname(new URL(import.meta.url).pathname),
  serverEntryPoint: '/entry/server.jsx',
  clientEntryPoint: '/entry/client.jsx',
  createRenderFunction (createApp, { RouteContextProvider }) {
    return async function render (server, req, reply, url, options) {
      const data = { todoList: server.todoList }
      const app = createApp({ data, server, req, reply })
      const element = renderToString(
        createElement(app.Router, {
          location: url,
        }, createElement(RouteContextProvider, {
          ctx: app.ctx,
        }, app.Element({
          routes: app.routes
        })))
      )
      return { 
        hydration: devalue({
          data: app.ctx.data,
          error: undefined,
        }), 
        element
      }
    }
  },
})

app.setErrorHandler((err, req, reply) => {
  console.error(err)
  reply.code(500)
  reply.send('Check logs!')
})

app.post('/add', (req, reply) => {
  app.todoList.push(req.body.item)
  reply.send(0)
})

await app.vite.ready()
await app.listen(3000)
