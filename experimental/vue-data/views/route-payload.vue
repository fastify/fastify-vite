<template>
  <h2>Automatic route payload endpoint</h2>
  <template v-if="ctx.$loading">
  	<p>Loading...</p>
  </template>
  <template v-else>
	  <p>Message: {{message || ctx.$payload?.message}}</p>
	  <button @click="refreshPayload">
	    Click to refresh payload from server
	  </button>
  </template>
</template>

<script>
import { ref } from 'vue'
import { useHydration } from 'fastify-vite-vue/client'

export const path = '/route-payload'

export async function getPayload ({ req }) {
  // Simulate a long running request
  await new Promise((resolve) => setTimeout(resolve, 3000))
  
  return {
    message: req?.query?.message || 'Hello from server',
  }
}

export default {
	setup () {
  	const ctx = useHydration({ getPayload })
  	const message = ref(null)

	  // Example of manually using ctx.$payloadPath()
	  // to construct a new request to this page's automatic payload API
	  async function refreshPayload () {
	    ctx.$loading = true
	    const response = await window.fetch(`${
	      ctx.$payloadPath()
	    }?message=${
	      encodeURIComponent('Hello from client')
	    }`)
	    const json = await response.json()
	    message.value = json.message
	    ctx.$loading = false
	  }
	  return { ctx, message, refreshPayload }
	 }
}
</script>
