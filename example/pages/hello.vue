<template>
  <h1 @click="refreshData">{{ data.message }}</h1>
</template>

<script>
import { ref } from 'vue'
import { useSSRData } from 'fastify-vite/hooks'

export default {
  setup () {
    const [ data, dataPath ] = useSSRData()
    const refreshData = async () => {
      const response = await fetch(dataPath)
      data.value = await response.json()
    }
    return { data, refreshData }
  }
}
</script>

<style scoped>
h1 {
  cursor: pointer;
  color: red;
}
</style>