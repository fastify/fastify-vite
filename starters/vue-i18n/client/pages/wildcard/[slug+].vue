<script>
export const layout = 'default'

export function getData ({ req }) {
  let pathMatch = req.params['*'];
  if (pathMatch.charAt(pathMatch.length - 1) == '/') {
    pathMatch = pathMatch.substr(0, pathMatch.length - 1);
  }

  return {
    pathMatch: pathMatch.split('/'),
    locale: req.route.locale,
  }
}

// Define routes that aren't the default locale (en)
export const i18n = {
  'sv': '/asterisk/:slug+',
  'da': '/asterisk/:slug+',
}
</script>

<script setup>
import { useData } from '$app/hooks'
import { useI18nUtils } from '/composables/i18n'

const { localePath } = useI18nUtils()

const data = useData()
</script>

<template>
  <h1>Wildcard example that matches /wildcard/*</h1>
  <p>Path match: {{ data.pathMatch }}</p>
  <p>Locale: {{ data.locale }}</p>
  <p>
    <router-link :to="localePath({ name: 'index' })">Go back to the index</router-link>
  </p>
</template>