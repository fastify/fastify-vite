<template>
  <router-view v-slot="{ Component }">
    <Suspense>
      <component :key="route.path" :is="Component" />
    </Suspense>
  </router-view>
</template>

<script>
import { useHead } from '@vueuse/head'
import { useRoute } from 'vue-router'
import head from '@app/head.js'

export default {
  setup () {
  	if (head) {
  		useHead(head)
  	}
  }
}
</script>
