<template>
  <h1>Index Page</h1>
  <p><router-link to="/about">Go to /about</router-link></p>
</template>

<script>
import { useFastify } from 'fastify-vite-vue/server'

export const path = '/'

export default {
  async setup () {
    const fastify = useFastify()
    console.log(typeof fastify)
    return
  }
}
</script>
