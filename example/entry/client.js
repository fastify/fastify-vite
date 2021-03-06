import { createApp } from '../main'

const { app, router } = createApp()

app.config.globalProperties.$ssrDataPath = () => `${document.location.pathname}/data`
app.config.globalProperties.$ssrData = window.$ssrData

// Wait until router is ready before mounting to ensure hydration match
router.isReady().then(() => app.mount('#app'))
