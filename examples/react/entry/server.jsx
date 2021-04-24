import { createApp } from '../main'
import { getRender } from 'fastify-vite/server/react'

export const render = getRender(createApp)
