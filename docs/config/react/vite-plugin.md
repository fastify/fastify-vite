# Vite Plugin

The **`@fastify/react/plugin`** Vite plugin has the following options:

```js {14-15}
import { resolve } from 'node:path'
import { fileURLToPath } from 'url'

import viteReact from '@vitejs/plugin-react'
import viteFastify from '@fastify/vite/plugin'
import viteFastifyReact from '@fastify/react/plugin'

export default {
  root: resolve(import.meta.dirname, 'client'),
  plugins: [
    viteReact(),
    viteFastify(),
    viteFastifyReact({
      globPattern: '/views/**/*.vue',
      paramPattern: /\$(\w+)/,
    }),
  ],
}
```

Read the [Router Setup](/react/router-setup) section to learn more about them.
