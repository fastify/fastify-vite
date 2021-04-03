<template>
  <h1>Home</h1>
  <p>Here's some global data from the server: {{ $global }}</p>
  <button @click="state.count++">count is: {{ state.count }}</button>
  <button @click="fetchFromEcho">msg is: {{ state.msg }}</button>
</template>

<script setup>
import { reactive, getCurrentInstance, ref } from 'vue'
import { useServerAPI, useServerData } from 'fastify-vite/hooks'

const api = useServerAPI()
const data = await useServerData(async () => {
  const { json } = await api.echo({ msg: 'hello from server '})
  return json
})
const state = reactive({ count: 0, msg: data.msg })
const fetchFromEcho = async () => {
  const { json } = await api.echo({ msg: 'hello from client '})
  state.msg = json.msg
}
</script>

<style scoped>
h1,
a {
  color: green;
}
</style>
