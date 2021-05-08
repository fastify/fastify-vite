import { createApp } from '../main'
import { getRender } from 'fastify-vite-react/server'

export const render = getRender(createApp)
