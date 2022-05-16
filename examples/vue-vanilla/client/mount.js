import { createApp } from './base.js'

createApp(window.hydration)
  .then(({ instance, router }) => {
    router.isReady().then(() => {
      instance.mount('main')
    })
  })
