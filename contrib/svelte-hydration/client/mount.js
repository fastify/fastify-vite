import Base from './base.svelte'

new Base({
  target: document.getElementById('root'),
  props: window.hydration,
  hydrate: true
})
