
import { onIdle } from 'fastify-vite/client'
import { hydrate } from 'fastify-vite-vue/client'

onIdle(async () => {
  const { createApp } = await import('../client')
  const { app } = createApp()
  hydrate(app)
  app.mount('#app')
})
