<template>
  <h1>Accessing Global Data from the Server</h1>

  <!-- Global Data comes from req.$global and it's already injected as globalProperties -->
  <p>{{ $global }}</p>

  <!-- You can also access it from setup() via useHydration() and make it available in other ways -->
  <p>{{ foobar }}</p>
</template>

<script setup>
import { useHydration } from 'fastify-vite-vue/client'

const { $global: foobar } = await useHydration()
</script>
