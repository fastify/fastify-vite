<template>
	<h1>This won't render because of an error</h1>
	<p>The Error component provided in client.vue is displayed instead.</p>
</template>

<script>
import { useData } from 'fastify-vite-vue/app'

// How this view is registered as a route
export const path = '/five'

export function getData () {
	throw new Error('Error from getData')
}

export default {
  setup () {
    return useData()
  }
}
</script>
