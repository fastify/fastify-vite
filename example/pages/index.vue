<template>
  <h1>Home</h1>
  <p>SSR data: {{ ssrData }}</p>
  <button @click="state.count++">count is: {{ state.count }}</button>

</template>

<script setup>
import { getSSRData } from '../main'
import { ref, reactive, defineAsyncComponent } from 'vue'

const ssrData = getSSRData()
const state = reactive({ count: 0 })
</script>

<style scoped>
h1,
a {
  color: green;
}
</style>