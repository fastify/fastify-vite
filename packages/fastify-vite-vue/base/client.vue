<template>
  <router-view v-slot="{ Component }">
    <Suspense @resolve="hydrationDone">
      <component :key="$route.path" :is="Component" />
    </Suspense>
  </router-view>
</template>

<script>
import { useHead } from '@vueuse/head'
import { useRoute } from 'vue-router'
import { hydrationDone } from 'fastify-vite-vue/client.mjs'
import head from '@app/head.js'

export default {
  setup () {
  	if (head) {
  		useHead(head)
  	}
    return { hydrationDone }
  },
}
</script>

<style>
* {
  font-family: sans-serif;
}
</style>
