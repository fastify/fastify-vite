import Base from './base.svelte'

new Base({
  target: document.querySelector('main'),
  props: window.hydration,
  hydrate: true
})
