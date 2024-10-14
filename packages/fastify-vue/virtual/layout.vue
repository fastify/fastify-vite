<template>
  <!-- eslint-disable-next-line vue/multi-word-component-names -->
  <component :is="layout">
    <slot />
  </component>
</template>

<script>
import { inject } from 'vue'
import { routeLayout } from '@fastify/vue/client'

import * as DefaultLayout from '/:layouts/default.vue'
const appLayouts = import.meta.glob('/layouts/*.vue', { eager: true })

appLayouts['/layouts/default.vue'] ??= DefaultLayout

export default {
  components: Object.fromEntries(
    Object.keys(appLayouts).map((path) => {
      const name = path.slice(9, -4)
      return [name, appLayouts[path].default]
    }),
  ),
  setup: () => ({
    layout: inject(routeLayout),
  }),
}
</script>
