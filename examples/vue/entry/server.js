import { createApp } from '../main'
import { getRender } from 'fastify-vite/server/vue'

export const render = getRender(createApp)
