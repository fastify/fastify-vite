import { createApp } from '@app/client.js'
import { hydrate } from 'fastify-vite-vue/client.mjs'

createApp().then(({ app, router }) => {
  // Wait until hydration payload has loaded
  // Wait until router is ready before mounting to ensure hydration match
  router.isReady().then(() => {
    hydrate(app)
    app.mount('#app')
  })
})
