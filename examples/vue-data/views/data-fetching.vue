<template>
  <h2>Isomorphic data fetching</h2>
  <p v-if="ctx.$loading">Loading...</p>
  <p v-else>{{ JSON.stringify(ctx.$data) }}</p>
</template>

<script>
import { useHydration, isServer } from 'fastify-vite-vue/client'
import ky from 'ky-universal'

export const path = '/data-fetching'

export async function getData ({ req }) {
  return {
    message: isServer
      ? req.query?.message ?? 'Hello from server'
      : 'Hello from client',
    result: await ky('https://httpbin.org/json').json(),
  }
}

export default {
  async setup () {
    const ctx = await useHydration({ getData })
    return { ctx }
  }
}
</script>
