<template>
  <template v-for="year in years">
    <h1>{{ year }}</h1>
    <template v-for="month in year.months">
      <template v-for="entry in archive[year][month]">
        <p class="title"><a :href="entry.path">{{ entry.title }}</a></p>
      </template>
    </template>
  </template>
</template>

<script>
import { usePayload } from 'fastify-vite-vue/client'

export const path = '/'

export function getPayload ({ fastify }) {
  const archive = fastify.press.archive
  const years = Object.keys(archive)
  for (const year of years) {
    year.months = Object.keys(years).sort()
  }
  return { archive, years }
}

export default {
  setup: usePayload,
}
</script>
