import { resolve } from 'node:path';
import { viteFastify } from '@fastify/vite';
import viteReact from '@vitejs/plugin-react';

/** @type {import('vite').UserConfig} */
export default {
	base: '/app/',
	root: resolve(import.meta.dirname, 'src/client'),
	plugins: [
		viteReact(),
		viteFastify({ distDir: resolve(import.meta.dirname, 'dist') }),
	],
	build: {
		emptyOutDir: true,
		outDir: resolve(import.meta.dirname, 'dist/client'),
	},
};
