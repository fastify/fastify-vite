// Adapted from Máximo Mussini's iles:
// https://github.com/ElMassimo/iles/blob/main/packages/hydration/hydration.ts

export const onIdle = (
  window.requestIdleCallback || (fn => setTimeout(fn, 1000))
)

export function onMedia (query, fn) {
  const mediaQuery = matchMedia(query)
  if (mediaQuery.matches) {
    fn()
  } else {
    mediaQuery.addEventListener('change', fn, { once: true })
  }
}

export function onDisplay (id, fn) {
  const observer = new IntersectionObserver(([{ isIntersecting }]) => {
    if (isIntersecting) {
      observer.disconnect()
      fn()
    }
  })
  const fragment = document.getElementById(id)
  if (!fragment) {
    throw new Error(`onDisplay: fragment #${id} not found`)
  }
  for (const child of Array.from(fragment.children)) {
    observer.observe(child)
  }
}

/* global IntersectionObserver, matchMedia */
