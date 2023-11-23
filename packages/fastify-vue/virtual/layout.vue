<template>
  <component :is="layout">
    <slot />
  </component>
</template>

<script>
import { inject } from 'vue'
import { routeLayout } from '/:core.js'

import * as DefaultLayout from '/:layouts/default.vue'
const appLayouts = import.meta.glob('/layouts/*.vue', { eager: true })

appLayouts['/layouts/default.vue'] ??= DefaultLayout

export default {
  setup: () => ({
    layout: inject(routeLayout)
  }),
  components: Object.fromEntries(
    Object.keys(appLayouts).map((path) => {
      const name = path.slice(9, -4)
      return [name, appLayouts[path].default]
    })
  )
}
</script>
