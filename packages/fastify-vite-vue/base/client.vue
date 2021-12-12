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
import { hydrationDone } from 'fastify-vite-vue/app'
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
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
body {
  margin: 0px auto;
  width: 500px;
}
ul {
  margin: 0px;
  padding: 0px;
}
li {
  list-style-type: none;
  padding-left:  0px;
}
li span {
  margin-right: 0.5rem;
}
code {
  font-weight:  bold;
  font-size:  1rem;
  color: #555;
}
</style>
