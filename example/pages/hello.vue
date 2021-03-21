<template>
  <h1 @click="refreshData">{{ state.message }}</h1>
</template>

<script>
import { ref, reactive, getCurrentInstance } from 'vue'
import { useServerData } from 'fastify-vite/hooks'

export default {
  async setup () {
    const [ data, dataPath ] = await useServerData()
    const state = reactive({ message: data?.message })
    const refreshData = async () => {
      const response = await fetch(dataPath)
      const json = await response.json()
      state.message = json.message
    }
    // If navigation happened client-side
    if (!data && !import.meta.env.SSR) {
      await refreshData()
    }
    return { state, refreshData }
  }
}
</script>

<style scoped>
h1 {
  cursor: pointer;
  color: red;
}
</style>