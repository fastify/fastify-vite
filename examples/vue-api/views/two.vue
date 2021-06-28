<template>
  <h1>Home</h1>
  <p>Here's some global data from the server: {{ ctx.$global }}</p>
  <button @click="state.count++">count is: {{ state.count }}</button>
  <button @click="fetchFromEcho">msg is: {{ state.msg }}</button>
</template>

<script>
import { reactive, getCurrentInstance, ref } from 'vue'
import { useHydration } from 'fastify-vite-vue/client'

export async function onRequest (req) {
  // Hook functions exported from a view 
  // are bound to the current Fastify instance
  req.$data = await this.api.client.echo({ msg: 'hello from server' })
}

export default {
  async setup () {
    const { $global, $data, $api } = await useHydration()
    const state = reactive({ count: 0, msg: $data.msg })
    async function fetchFromEcho () {
      const { json } = await $api.echo({ msg: 'hello from client' })
      state.msg = json.msg
    }
    return { ctx, state, fetchFromEcho }
  }
}
</script>

<style scoped>
h1,
a {
  color: green;
}
</style>
