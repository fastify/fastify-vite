import { createApp } from '../main'
import { getRender } from 'fastify-vite/render'

export const render = getRender(createApp)
