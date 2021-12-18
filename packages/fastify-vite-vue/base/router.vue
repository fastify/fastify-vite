<template>
	<router-view v-slot="{ Component }">
	  <Suspense @resolve="hydrationDone">
	    <component :key="$route.path" :is="Component" />
	  </Suspense>
	</router-view>
</template>

<script setup>
import { hydrationDone } from 'fastify-vite-vue/app'
</script>
