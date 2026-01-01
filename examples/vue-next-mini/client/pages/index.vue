<template>
  <p>
    <router-link to="/items"> Go to /items </router-link>
  </p>
  <p>
    <router-link to="/items/nested"> Go to /items/nested </router-link>
  </p>
</template>

<script>
export function configure (server) {
  server.log.info('configure() hook picked up from route module!')
}
</script>
