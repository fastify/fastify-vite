<template>
  <h1>Home</h1>
  <button @click="state.count++">count is: {{ state.count }}</button>

</template>

<script setup>
import { ref } from 'vue'

const state = ref({ count: 0 })
</script>

<style scoped>
h1,
a {
  color: green;
}
</style>
