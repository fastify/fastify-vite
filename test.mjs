$.verbose = true

import { setTimeout } from 'node:timers/promises'
const root = path.resolve(__dirname)

cd(path.join(root, 'packages/fastify-vite'))

await $`npx vitest run`
await $`sleep 1`

for (const example of [
  'react-vanilla',
  'vue-vanilla',
  'svelte-vanilla',
  'solid-vanilla',
  'react-hydration',
  'vue-hydration',  
  'svelte-hydration',
  'solid-hydration',
  'react-next',
  'vue-next',
  'react-streaming',  
  'vue-streaming',
  'react-vanilla-spa',
  'vue-vanilla-spa'
]) {
  cd(path.join(root, 'examples', example))
  await $`node --test`
  await setTimeout(100)
}
