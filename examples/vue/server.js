import Fastify from 'fastify'
import FastifyVite from 'fastify-vite'
import { dirname } from 'path'
import { renderToString } from '@vue/server-renderer'
import devalue from 'devalue'

const app = Fastify()

app.decorate('todoList', [
  'Do laundry',
  'Respond to emails',
  'Write report',
])

app.get('/data', (_, reply) => {
  reply.send({ todoList: app.todoList })
})

await app.register(FastifyVite, {
  dev: process.argv.includes('--dev'),
  configRoot: dirname(new URL(import.meta.url).pathname),
  createRenderFunction (createApp) {
    return async function (server, req, reply, url, config) {
      const data = { todoList: server.todoList }
      const app = await createApp({ data, server, req, reply })
      app.router.push(url)
      await app.router.isReady()
      const element = await renderToString(app.instance, app.ctx)
      return {
        hydration: devalue(app.ctx.data),
        element,
      }
    }
  },
})

app.post('/add', (req, reply) => {
  app.todoList.push(req.body.item)
  reply.send(0)
})

await app.vite.ready()
await app.listen(3000)
