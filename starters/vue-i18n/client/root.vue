<script>
import { i18n } from '/i18n.js'

export { default } from '$app/router.vue'

export function configure ({ app, router }) {
  app.use(i18n)

  // Use this to configure/extend your Vue app and router instance
  router.beforeEach(async (to) => {
    // If you are loading things inside context.js, it's a good idea to reload the page
    // when the locale changes (to / from) when using localePrefix
    i18n.global.locale.value = to.meta.locale ?? "en"
  })
}
</script>
