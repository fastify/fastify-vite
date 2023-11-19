<template>
  <h1>{{ message }}</h1>
  <p><img :src="logo" /></p>
  <ul class="columns-2">
    <li><router-link to="/using-data">/using-data</router-link> demonstrates how to 
    leverage the <code>getData()</code> function 
    and <code>useRouteContext()</code> to retrieve server data for a route.</li>
    <li><router-link to="/using-store">/using-store</router-link> demonstrates how to 
    retrieve server data and maintain it in the global state.</li>
    <li><router-link to="/using-auth">/using-auth</router-link> demonstrates how to 
    wrap a route in a custom layout component.</li>
    <li><router-link to="/client-only">/client-only</router-link> demonstrates how to set 
    up a route for rendering on the client only (disables SSR).</li>
    <li><router-link to="/server-only">/server-only</router-link> demonstrates how to set 
    up a route for rendering on the server only (sends no JavaScript).</li>
    <li><router-link to="/streaming">/streaming</router-link> demonstrates how to set 
    up a route for SSR in streaming mode.</li>
  </ul>
</template>

<script setup>
import { isServer, useRouteContext } from '/dx:core.js'
import logo from '/assets/logo.svg'

const { state } = useRouteContext()

if (isServer) {
  // State is automatically hydrated on the client
  state.message = 'Welcome to Fastify DX for Vue!'
}

const message = state.message
</script>

<script>
export function getMeta () {
  return {
    title: 'Welcome to Fastify DX!'
  }
}
</script>
