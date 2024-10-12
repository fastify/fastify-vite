import { resolve } from "node:path";
import { viteFastify } from "@fastify/vite/plugin";
import viteReact from "@vitejs/plugin-react";

/** @type {import('vite').UserConfig} */
export default {
  root: resolve(import.meta.dirname, "src/client"),
  plugins: [viteReact(), viteFastify()],
  build: {
    emptyOutDir: true,
    outDir: resolve(import.meta.dirname, "dist/client"),
  },
};
