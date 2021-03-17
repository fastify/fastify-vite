<template>
  <h1>Home</h1>
  <button @click="state.count++">count is: {{ state.count }}</button>
  <button @click="fetchFromEcho">msg is: {{ state.msg }}</button>
</template>

<script setup>
import { reactive } from 'vue'
import { useServerAPI } from 'fastify-vite/hooks'

const api = useServerAPI()
const state = reactive({ count: 0, msg: '' })
const fetchFromEcho = async () => {
  const { json } = await api.echo({ msg: 'hello '})
  state.msg = json.msg
}
</script>

<style scoped>
h1,
a {
  color: green;
}
</style>
