import { createApp } from '/client.js'
import { hydrate } from 'fastify-vite-vue/client.js'
const { app, router } = createApp()

// Wait until hydration payload has loaded
hydrate(app).then(() => {
  // Wait until router is ready before mounting to ensure hydration match
  router.isReady().then(() => app.mount('#app'))
})
