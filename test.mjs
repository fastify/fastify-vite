$.verbose = true

import { setTimeout } from 'node:timers/promises'
const root = path.resolve(__dirname)

cd(path.join(root, 'packages/fastify-vite'))

await $`npx vitest run`
await $`sleep 1`

if (process.stdout.isTTY) {
  for (const example of [
    'react-vanilla',
    'react-vanilla-spa',
    'react-vanilla-ts',
    'react-hydration',
    'react-next-mini',
    'react-streaming',
    'vue-vanilla',
    'vue-vanilla-spa',
    'vue-vanilla-ts',
    'vue-hydration',
    'vue-next-mini',
    'vue-streaming',
  ]) {
    cd(path.join(root, 'examples', example))
    await $`node --test`
  }
}

// for (const contrib of [
//   'svelte-vanilla',
//   'svelte-hydration',
//   'solid-vanilla',
//   'solid-hydration',
//   'react-vanilla',
//   'react-hydration',  
//   'react-next',
//   'react-streaming',
//   'react-vanilla-spa',
// ]) {
//   cd(path.join(root, 'contrib', contrib))
//   await $`node --test`
//   await setTimeout(100)
// }
