<template>
  <h1>2: getData() and useData()</h1>
  <p v-for="{ text, to } in links">
    <router-link :to="to">{{ text }}</router-link>
  </p>
</template>

<script>
import { useData } from 'fastify-vite-vue/app'

// How this view is registered as a route
export const path = '/two'

// Unlike getPayload, this function is executed directly,
// as-is, during both SSR and client-side navigation,
// before a route is rendered

// useData() can be used to retrieve its result and will 
// return the same data both on the server and on the client

// After SSR, on first-render, it's hydrated from the server
// so it doesn't have to be executed again on the client

export function getData () {
  return {
    links: [
      {to: '/one', text: 'Go to /one'},
      {to: '/three/123', text: 'Go to /three/123'},
    ]
  }
}


export default {
  setup () {
    return useData()
  }
}
</script>
