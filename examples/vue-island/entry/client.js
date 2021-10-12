
import { onIdle } from 'fastify-vite/client'
import { hydrate } from 'fastify-vite-vue/client'

document.querySelector('#app').addEventListener('mouseover', async () => {
  const { createApp } = await import('../client')
  const { app } = createApp()
  hydrate(app)
  app.mount('#app')
})
