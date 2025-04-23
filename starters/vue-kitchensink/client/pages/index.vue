<template>
  <h1>{{ message }}</h1>
  <p><img :src="logo" /></p>
  <ul class="columns-2">
    <li><router-link to="/using-data">/using-data</router-link> — <b>isomorphic data fetching</b>.</li>
    <li><router-link to="/using-store">/using-store</router-link> — <b>universal</b> <code>reactive()</code> stores.</li>
    <li><router-link to="/using-auth">/using-auth</router-link> — <b>custom layout</b>.</li>
    <li><router-link to="/form/123">/form/123</router-link> — <code>POST</code> to dynamic route.</li>
    <li><router-link to="/client-only">/client-only</router-link> — <b>disabling</b> SSR.</li>
    <li><router-link to="/server-only">/server-only</router-link> — <code>0kb</code> JavaScript.</li>
    <li><router-link to="/streaming">/streaming</router-link> — <b>streaming</b> SSR.</li>
    <li><router-link to="/wildcard/another/one">/wildcard/another/one</router-link> — <b>wildcard route matching</b> <code>/wildcard/*</code></li>
  </ul>
</template>

<script setup>
import { useState } from '$app/hooks'
import logo from '/assets/logo.svg'

const state = useState()

if (import.meta.env.SSR) {
  // State is automatically hydrated on the client
  state.message = 'Welcome to @fastify/vue!'
}

const message = state.message
</script>

<script>
export function getMeta () {
  return {
    title: 'Welcome to @fastify/vue!'
  }
}
</script>

<style>
.dummy {
  color: black;
}
</style>
