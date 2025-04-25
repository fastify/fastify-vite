<template>
  <h1>{{ data.message }}</h1>
  <p><img :src="logo" /></p>
</template>

<script setup>
import { useData } from '$app/hooks'
import logo from '/assets/logo.svg'

const data = useData()
</script>

<script>
export function getData() {
  return {
    message: 'Welcome to @fastify/vue!'
  }
}

export function getMeta () {
  return {
    title: 'Welcome to @fastify/vue!'
  }
}
</script>

<style scoped>
img {
  width: 100%;
}
</style>
