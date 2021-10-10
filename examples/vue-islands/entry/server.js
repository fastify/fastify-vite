import { createServerEntryPoint } from 'fastify-vite-vue/server'
import * as client from '../client.js'

export default createServerEntryPoint(client)
