import { createApp } from './app.js'

createApp().then(({ app, router }) => {
  router.isReady().then(() => {
    app.mount('main')
  })
})
