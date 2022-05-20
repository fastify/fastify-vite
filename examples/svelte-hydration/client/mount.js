import Base from './base.svelte'

new Base({
  target: document.querySelector('main'),
  props: { data: window.hydration.data },
  hydrate: true,
})
