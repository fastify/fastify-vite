import { resolve } from 'node:path';
import { saveViteConfigToDist } from '@fastify/vite/vite-plugins';
import viteReact from '@vitejs/plugin-react';

/** @type {import('vite').UserConfig} */
export default {
	base: '/app/',
	root: resolve(import.meta.dirname, 'src/client'),
	plugins: [
		viteReact(),
		saveViteConfigToDist({ distDir: resolve(import.meta.dirname, 'dist') }),
	],
	build: {
		emptyOutDir: true,
		outDir: resolve(import.meta.dirname, 'dist/client'),
	},
};
