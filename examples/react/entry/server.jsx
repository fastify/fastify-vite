import { createApp } from '../main'
import { getRender } from 'fastify-vite/react/render'

export const render = getRender(createApp)
