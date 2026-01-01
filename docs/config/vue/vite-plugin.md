# Vite Plugin

The **`@fastify/vue/plugin`** Vite plugin has the following options:

```js {14-15}
import { resolve } from 'node:path'

import viteVue from '@vitejs/plugin-vue'
import viteFastify from '@fastify/vite/plugin'
import viteFastifyVue from '@fastify/vue/plugin'

export default {
  root: resolve(import.meta.dirname, 'client'),
  plugins: [
    viteVue(),
    viteFastify(),
    viteFastifyVue({
      globPattern: '/views/**/*.vue',
      paramPattern: /\$(\w+)/,
    }),
  ],
}
```

Read the [Router Setup](/vue/router-setup) section to learn more about them.
