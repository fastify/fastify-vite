<script lang="ts">
export const layout = 'default'

interface FormData extends Record<string, unknown> {
  number: string
}

export function getData({ req, reply }: RouteContext) {
  if (req.method === 'POST') {
    if ((req.body as FormData).number !== '42') {
      return reply.redirect('/')
    }
    return req.body as FormData
  } else {
    return {
      number: '',
    }
  }
}
</script>

<script setup lang="ts">
import { useData } from '$app/hooks'
const data = useData<FormData>()
</script>

<template>
  <h1>Form example with dynamic URL</h1>
  <form method="post">
    <label for="name">Magic number:</label>
    <br />
    <input type="text" id="number" name="number" :value="data.number" />
    <br />
    <input type="submit" value="Submit" />
  </form>
</template>
