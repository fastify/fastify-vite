<template>
  <div>
    <router-link to="/">Index</router-link> - 
    <router-link to="/hello">Hello</router-link>
    <router-view v-slot="{ Component }">
      <Suspense>
        <component :key="route.path" :is="Component" />
      </Suspense>
    </router-view>
  </div>
</template>

<script>
import { useHead } from '@vueuse/head'
import { useRoute } from 'vue-router'

export default {
  setup () {
    useHead({
      title: 'Vite App',
      meta: [{
        charset: 'utf-8',
      }, {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0',
      }]
    })
    return { route: useRoute() }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
