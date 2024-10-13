const root = path.resolve(__dirname)

cd(path.join(root, 'packages/fastify-vite'))
await $`npx vitest run`
await $`sleep 2`

for (const example of [
  'react-hydration',
  'react-next',
  'react-streaming',
  'react-vanilla',
  'react-vanilla-spa',
  'solid-hydration',
  'solid-vanilla',
  'svelte-hydration',
  'svelte-vanilla',
  'typescript-vanilla',
  'vue-hydration',
  'vue-next',
  'vue-streaming',
  'vue-vanilla',
  'vue-vanilla-spa',
]) {
  cd(path.join(root, 'examples', example))
  await $`node --test`
  await $`sleep 2`
}
