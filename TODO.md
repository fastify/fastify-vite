
- Verify whether or not ensureESMBuild() is still required for Svelte
  - Does it hurt to have it as a default for everything else?
- New master @fastify/vite/plugin to be used in all setups
- Make the default location for persisting vite configuration dist/server 
  - Unless spa mode is activated, then use dist/client
    - Or, to a setting is set explicitly in the plugin options
  
  import { resolve } from "node:path";
  import fastifyVitePlugin from "@fastify/vite/plugin";
  
  export default {
    plugins: [
      fastifyVitePlugin({
        ..: 
      }),
    ],
  };