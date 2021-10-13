
function addScript (src, type) {
  const script = document.createElement('script')
  script.setAttribute('src', src)
  script.setAttribute('type', type)
  document.head.appendChild(script)
}

function onIdle (callback) {
  let requestIdleCallback = window.requestIdleCallback
  if (!window.requestIdleCallback) {
    requestIdleCallback = fn => setTimeout(fn, 200)
  }
  requestIdleCallback(callback)
}

function onMedia (query) {
  return function onMedia (fn) {
    const mediaQuery = matchMedia(query)
    if (mediaQuery.matches) {
      fn()
    } else {
      mediaQuery.addEventListener('change', fn, { once: true })
    }
  }
}

function onDisplay (id) {
  return function onDisplay (fn) {
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
}

// onIdle, onMedia and onDisplay were adapted from iles:
// https://github.com/ElMassimo/iles/blob/main/packages/hydration/hydration.ts
// Which was itself based on Astro:
// https://github.com/snowpackjs/astro/tree/main/packages/astro/src/frontend/hydrate

/* global IntersectionObserver, matchMedia */

module.exports = {
  addScript,
  onIdle,
  onMedia,
  onDisplay,
}
