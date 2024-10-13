<script>
export const layout = 'default'

export function getData ({ req, reply }) {
  if (req.method === 'POST') {
    if (req.body.number !== '42') {
      return reply.redirect('/')
    }
    return req.body
  } else {
    return {
      number: ''
    }
  }
}
</script>

<script setup>
import { useRouteContext } from '/:core.js'
const { data } = useRouteContext()
console.log('data', data)
</script>

<template>
  <h1>Form example with dynamic URL</h1>
  <form method="post">
    <label for="name">Magic number:</label>
    <br>
    <input type="text" id="number" name="number" :value="data.number">
    <br>
    <input type="submit" value="Submit">
  </form>
</template>