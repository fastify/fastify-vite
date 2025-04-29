<script>
export { default } from '$app/router.vue'

export const mount = '#root'

export function scrollBehavior() {
  // Always scroll to the top
  return { top: 0, left: 0 };
}

export function configure ({ app, router }) {
  // Use this to configure/extend your Vue app and router instance
}
</script>
