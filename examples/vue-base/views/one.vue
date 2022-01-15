<template>
  <h1>1: getPayload() and usePayload()</h1>
  <p v-for="{ text, to } in links">
    <router-link :to="to">{{ text }}</router-link>
  </p>
</template>

<script>
import { usePayload } from 'fastify-vite-vue/app'

// How this view is registered as a route
export const path = '/one'

// This function is automatically registered as an 
// API endpoint at /-/payload${path}

// During SSR, it's called automatically and $payload
// becomes available via the useIsomorphic() hook.

// During client-side navigation, an API request to the 
// registered endpoint is fired before each route renders
// and $payload is available just the same

// After SSR, on first-render, it's hydrated from the server
// so it doesn't have to be executed again on the client
export function getPayload () {
  return {
    links: [
      {to: '/two', text: 'Go to /two'},
    ]
  }
}

export default {
  setup () {
    // Makes links available to the template
    return usePayload()
  }
}
</script>
