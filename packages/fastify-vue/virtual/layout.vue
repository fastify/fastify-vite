<script>
import { h, inject, unref } from 'vue'
import { routeLayout } from '@fastify/vue/client'
import * as DefaultLayout from '/$app/layouts/default.vue'

const appLayouts = import.meta.glob('/layouts/*.vue', { eager: true })
appLayouts['/layouts/default.vue'] ??= DefaultLayout

const layouts = Object.fromEntries(
  Object.keys(appLayouts).map((path) => [path.slice(9, -4), appLayouts[path].default]),
)

export default {
  setup(_, { slots }) {
    const layoutRef = inject(routeLayout)
    return () => {
      const name = unref(layoutRef) ?? 'default'
      const LayoutComponent = layouts[name] ?? layouts.default
      const children = () => slots.default?.()
      return LayoutComponent ? h(LayoutComponent, null, { default: children }) : children()
    }
  },
}
</script>
