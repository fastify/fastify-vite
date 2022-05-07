import createApp from './app.js'

createApp().then(({ instance, router }) => {
  router.isReady().then(() => {
    instance.mount('main')
  })
})
