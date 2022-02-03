import '@app/index.css'

import { createApp } from '@app/client.js'

createApp().then(async ({ app, router }) => {
  await router.isReady()
  app.mount('#app')
})
