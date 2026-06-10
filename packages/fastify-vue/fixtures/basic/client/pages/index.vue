<template>
  <h1>{{ message }}</h1>
</template>

<script setup>
const message = 'Welcome to @fastify/vue!'
</script>

<script>
export function getMeta() {
  return {
    title: 'Welcome to @fastify/vue!',
  }
}
</script>
