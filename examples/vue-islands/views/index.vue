<template>
	<p>Test</p>
</template>

<script>
// import island from './island.vue'
import { useFastify } from 'fastify-vite-vue/server'

export default {
	async setup() {
		const fastify = useFastify()
		const island = await fastify.vite.render('header')
		console.log(island)
	}
	// components: { island },
}
</script>

