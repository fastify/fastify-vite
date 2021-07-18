<template>
  <h2>Isomorphic data fetching</h2>
  <p v-if="ctx.$loading">Loading...</p>
  <p v-else>{{ JSON.stringify(ctx.$data) }}</p>
</template>

<script>
import { useHydration, isServer } from 'fastify-vite-vue/client'

export const path = '/data-fetching'

export async function getData ({ req, $api }) {
  return {
    message: isServer
      ? req.query?.message ?? 'Hello from server'
      : 'Hello from client',
    result: await $api.echo({
      msg: 'Hello from API method',
    }),
  }
}

export default { setup: useHydration }
</script>
