import { createApp } from '../main'
import { getRender } from 'fastify-vite/vue/render'

export const render = getRender(createApp)
