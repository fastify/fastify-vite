import Page from './page.svelte'

new Page({
  target: document.querySelector('main'),
  hydrate: true,
})
