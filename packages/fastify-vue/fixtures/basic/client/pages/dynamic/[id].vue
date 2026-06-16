<template>
  <h1>Dynamic Route</h1>
  <p>Item ID: {{ id }}</p>
</template>

<script>
import { useData } from '$app/hooks'

export function getData({ req }) {
  return {
    id: req.params.id,
  }
}

export default {
  setup() {
    const data = useData()
    return { id: data.id }
  },
}
</script>
