<template>
	<div class="island" v-html="{{ header }}">
	</div>
</template>

<script>
import { useFastify } from 'fastify-vite-vue/server'

export default {
	props: {
		name: String,
		required: true,
	},
	async setup () {
		const fastify = useFastify()
		const { island: header, scripts } = await fastify.vite.render('header')
		console.log('scripts', scripts)
		return { header }
	}
}
</script>

<style>
.island {
  display: contents
}
</style>