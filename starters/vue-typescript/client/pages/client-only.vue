<template>
	<p>This route is rendered on the client only!</p>
  <p>
    <router-link to="/">Go back to the index</router-link>
  </p>
  <p>⁂</p>
  <p>When this route is rendered on the server, no SSR takes place.</p>
  <p>See the output of <code>curl http://localhost:3000/client-only</code>.</p>
</template>

<script>
export const clientOnly = true

export function getMeta () {
	return {
		title: 'Client Only Page'
	}
}
</script>