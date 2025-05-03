<template>
  <p>This route is rendered on the server only!</p>
  <p>
    <router-link to="/">Go back to the index</router-link>
  </p>
  <p>⁂</p>
  <p>When this route is rendered on the server, no JavaScript is sent to the client.</p>
  <p>See the output of <code>curl http://localhost:3000/server-only</code>.</p>
</template>

<script>
export const serverOnly = true
</script>