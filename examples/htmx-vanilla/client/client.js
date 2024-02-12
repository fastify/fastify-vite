const pages = import.meta.glob('/pages/*.jsx')

pages[document.documentElement.dataset.module]()

!async function () {
  const { default: htmx } = await import('htmx.org')
  window.htmx = htmx
}()
