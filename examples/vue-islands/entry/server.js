import { createServerEntryPoint } from 'fastify-vite-vue/server'

import client from '../client.js'
import views from '../views.js'

export default createServerEntryPoint(client, views)
