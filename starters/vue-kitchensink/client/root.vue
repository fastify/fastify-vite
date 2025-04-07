<script>
export { default } from '$app/router.vue'

export const mount = '#root'

export function scrollBehavior() {
  // Always scroll to the top
  return { top: 0, left: 0 };
}

export function configure ({ app, router }) {
  // Use this to configure/extend your Vue app and router instance
  router.beforeEach(async (to, from, next) => {
    // More i18n setup here!
    console.log("route locale", to.meta.locale);
    return next();
  });
}
</script>
