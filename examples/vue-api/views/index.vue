<template>
  <ul>
    <li>
      <router-link to="/global-data">Global Data</router-link><span>:</span>
      <b>useHydration()</b> and <b>$global</b> data.
    </li>
    <li>
      <router-link to="/route-hooks">Route Hooks</router-link><span>:</span>
      <b>onRequest()</b>, <b>useHydration()</b> and <b>$data</b>.
    </li>
    <li>
      <router-link to="/route-payload">Route Payload</router-link><span>:</span>
      <b>useHydration()</b>, <b>getPayload()</b> and <b>$payloadPath</b>.
    </li>
    <li>
      <router-link to="/data-fetching">Isomorphic API</router-link><span>:</span>
      <b>useHydration()</b>, <b>getData()</b> and <b>$data</b>.
    </li>
  </ul>
</template>

<script>
export const path = '/'
</script>
