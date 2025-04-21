import { join } from "node:path";
import viteFastify from "@fastify/vite/plugin";
import viteReact from "@vitejs/plugin-react";

export default {
  root: join(import.meta.dirname, "src", "client"),
  plugins: [viteFastify(), viteReact()],
  build: {
    outDir: join(import.meta.dirname, "dist"),
  },
};
