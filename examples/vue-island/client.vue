<template>
  <div>Island</div>
</template>

<script>
import { packIsland } from 'fastify-vite/app'

function loadJavaScriptOnlyAfter10Seconds (callback) {
  setTimeout(callback, 10*1000)
}

export const path = '/'
export const onSend = packIsland('#app', loadJavaScriptOnlyAfter10Seconds)
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
body {
  margin: 0px auto;
  width: 500px;
}
ul {
  margin: 0px;
  padding: 0px;
}
li {
  list-style-type: none;
  padding-left:  0px;
}
li span {
  margin-right: 0.5rem;
}
code {
  font-weight:  bold;
  font-size:  1rem;
  color: #555;
}
</style>
