<template>
  <h1>Examples</h1>
  <ol>
    <li>
      <router-link :to="/global-data">
        <code>useHydration()</code> and <code>$global</code> data.
      </router-link>
    </li>
    <li>
      <router-link :to="/isomorphic-data-fetching">
        <code>useHydration()</code>, <code>getData()</code> and <code>$data</code>.
      </router-link>
    </li>
    <li>
      <router-link :to="/exporting-route-hooks">
        <code>onRequest()</code>, <code>useHydration()</code> and <code>$data</code>.
      </router-link>
    </li>
  </ol>
</template>

<script>
import { reactive, getCurrentInstance, ref } from 'vue'
import { useHydration } from 'fastify-vite-vue/client'

export async function getData ({ api }) {
  const { json } = await api.echo({ msg: 'hello from server' })
  return json
}

export default {
  async setup () {
    const { $global, $data, $api } = await useHydration()
    const state = reactive({ count: 0, msg: $data.msg })
    async function fetchFromEcho () {
      const { json } = await $api.echo({ msg: 'hello from client' })
      state.msg = json.msg
    }
    return { ctx, state, fetchFromEcho }
  }
}
</script>

<style scoped>
h1,
a {
  color: green;
}
</style>
