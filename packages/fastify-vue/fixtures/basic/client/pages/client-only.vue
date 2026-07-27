<template>
  <p>This route is rendered on the client only!</p>
</template>

<script>
export const clientOnly = true

export function getMeta() {
  return {
    title: 'Client Only Page',
  }
}
</script>
