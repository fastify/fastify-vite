import { getIsland } from 'fastify-vite/app'
import { hydrate } from 'fastify-vite-vue/client'

async function main () {
  const island = getIsland(import.meta.url)

  if (island) {
    // Obvious Convention: Islands will never contain Vue Router
    const { createIsland } = await import('../client')
    const { app } = createIsland(island)

    app.mount(`#${island}`)
  } else {
    const { createApp } = await import('../client')
    const { app, router } = createApp()

    // Pick serialized values from window and populate context
    hydrate(app)

    // Wait until router is ready before mounting to ensure hydration match
    await router.isReady()

    app.mount('#app')
  }
}

main()
