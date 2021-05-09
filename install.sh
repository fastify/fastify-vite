
mkdir -p examples/react/node_modules
rm -rf examples/react/node_modules/fastify-vite
rm -rf examples/react/node_modules/fastify-vite-react
cp -r packages/fastify-vite examples/react/node_modules/fastify-vite
cp -r packages/fastify-vite-react examples/react/node_modules/fastify-vite-react

mkdir -p examples/vue/node_modules
rm -rf examples/vue/node_modules/fastify-vite
rm -rf examples/vue/node_modules/fastify-vite-vue
cp -r packages/fastify-vite examples/vue/node_modules/fastify-vite
cp -r packages/fastify-vite-vue examples/vue/node_modules/fastify-vite-vue
