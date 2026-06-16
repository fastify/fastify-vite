<script lang="ts">
export const layout = 'default'

export function getData({ req }: RouteContext) {
  let pathMatch = (req.params as Record<string, string>)['*']
  if (pathMatch.charAt(pathMatch.length - 1) == '/') {
    pathMatch = pathMatch.substr(0, pathMatch.length - 1)
  }

  return {
    pathMatch: pathMatch.split('/'),
  }
}
</script>

<script setup lang="ts">
import { useData } from '$app/hooks'
const data = useData<{ pathMatch: string[] }>()
</script>

<template>
  <h1>Wildcard example that matches /wildcard/*</h1>
  <p>Path match: {{ data.pathMatch }}</p>
</template>
