<script>
export const layout = 'default'

export function getData ({ req }) {
  let pathMatch = req.params['*'];
  if (pathMatch.charAt(pathMatch.length - 1) == '/') {
    pathMatch = pathMatch.substr(0, pathMatch.length - 1);
  }

  return {
    pathMatch: pathMatch.split('/'),
  }
}
</script>

<script setup>
import { useData } from '$app/hooks'
const data = useData()
</script>

<template>
  <h1>Wildcard example that matches /wildcard/*</h1>
  <p>Path match: {{ data.pathMatch }}</p>
</template>