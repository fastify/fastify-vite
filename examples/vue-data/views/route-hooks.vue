<template>
  <h2>Registering Fastify route hooks via exports</h2>
  <p>{{ ctx.$data ? ctx.$data.msg : 'Refresh (SSR) to get server data' }}</p>
</template>

<script>
import { useHydration, isServer } from 'fastify-vite-vue/client.mjs'

export const path = '/route-hooks'

export async function onRequest (req) {
  req.$data = { msg: 'hello from onRequest' }
}

export default {
  async setup () {
    const ctx = await useHydration()
    return { ctx }
  }
}
</script>
