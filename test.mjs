$.verbose = true

import { setTimeout } from 'node:timers/promises'
const root = path.resolve(__dirname)

cd(path.join(root, 'packages/fastify-vite'))

await $`npx vitest run`
await $`sleep 1`

// for (const example of [
//   'vue-vanilla',
//   'vue-hydration',
//   'vue-next',
//   'vue-streaming',
//   'vue-vanilla-spa'
// ]) {
//   cd(path.join(root, 'examples', example))
//   await $`node --test`
// }

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
