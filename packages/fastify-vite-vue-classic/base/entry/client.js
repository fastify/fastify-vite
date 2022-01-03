import '@app/index.css'

import { createApp } from '@app/client.js'

createApp().then(async ({ app, router }) => {
  router.onReady(() => app.$mount('#app'))
})
