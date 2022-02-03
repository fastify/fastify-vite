<template>
  <h1>3: using both getPayload and getData:</h1>
  <p v-for="{ text, to } in links">
    <router-link :to="to">{{ text }}</router-link>
  </p>
</template>

<script>
import { useData, usePayload } from 'fastify-vite-vue/app'

// How this view is registered as a route
export const path = '/three/:something'

// This demonstrates how to both 
// getData and getPayload can used in the same view

export function getData () {
  return {
    links: [
      {to: '/two', text: 'Go to /two'},
    ]
  }
}

export function getPayload () {
  return {
    links: [
      {to: '/four', text: 'Go to /four'},
    ]
  }
}

export default {
  setup () {
    return {
      links: [...useData().links, ...usePayload().links],
    }
  }
}
</script>
