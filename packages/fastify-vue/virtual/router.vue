<script>
import { h, Suspense } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import Layout from '/$app/layout.vue'

export default {
  setup() {
    const route = useRoute()
    const isServer = import.meta.env.SSR

    return () =>
      h(RouterView, null, {
        default: (slotProps) => {
          const Component = slotProps?.Component
          const child = Component ? h(Component, { key: route.path }) : null
          const wrapped = h(Layout, null, { default: () => child })
          return isServer ? wrapped : h(Suspense, null, { default: () => wrapped })
        },
      })
  },
}
</script>
