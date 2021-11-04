import { hydrate } from 'fastify-vite-vue/client'
import { createApp } from '../client'

const { app } = createApp()
hydrate(app)
app.mount('#app')
