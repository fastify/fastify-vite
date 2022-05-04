import { createApp } from './app'
const { app, router } = await createApp()

router.isReady().then(() => app.mount('main'))
