import { getRender } from 'fastify-vite-react/server'
import { createApp } from '../main'
import { routes } from '../base'

export const render = getRender({ createApp, routes })
