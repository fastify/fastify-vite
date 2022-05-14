import { createApp } from './base.js'

createApp().then(({ instance, router }) => {
  router.isReady().then(() => {
    instance.mount('main')
  })
})
