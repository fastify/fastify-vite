import Fastify from 'fastify'
import FastifyVite from 'fastify-vite'
import { dirname } from 'path'
import { renderToString } from '@vue/server-renderer'

const app = Fastify()

app.decorate('todoList', [
  'Do laundry',
  'Respond to emails',
  'Write report',
])

await app.register(FastifyVite, {
  dev: process.argv.includes('--dev'),
  configRoot: dirname(new URL(import.meta.url).pathname),
  createRenderFunction (createApp) {
    return async function (fastify, req, reply, url, config) {
      const { ctx, app, router } = await createApp({
        todoList: fastify.todoList,
      })
      router.push(url)
      await router.isReady()
      const element = await renderToString(app, ctx)
      return {
        ssrContext: JSON.stringify(ctx),
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
