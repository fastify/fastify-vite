import Fastify from 'fastify'
import FastifyVite from 'fastify-vite'
import { renderToString } from '@vue/server-renderer'

const app = Fastify({ logger: true })

await app.register(FastifyVite, {
  configRoot: import.meta.url,
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

app.decorate('todoList', [
  'Do laundry',
  'Respond to emails',
  'Write report',
])

app.post('/add', (req, reply) => {
  app.todoList.push(req.body.item)
  reply.send(0)
})

await app.listen(3000)
