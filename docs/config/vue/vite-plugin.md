# Vite Plugin

The **`@fastify/vue/plugin`** Vite plugin has the following options:

```js {14-15}
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

import viteVue from '@vitejs/plugin-vue'
import viteFastifyVue from '@fastify/vue/plugin'

const path = fileURLToPath(import.meta.url)

export default {
  root: join(dirname(path), 'client'),
  plugins: [
    viteVue(), 
    viteFastifyVue({
      globPattern: '/views/**/*.vue',
      paramPattern: /\$(\w+)/,
    }),
  ],
}
```

Read the [Router Setup](/vue/router-setup) section to learn more about them.