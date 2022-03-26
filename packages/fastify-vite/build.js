
// This file is meant to eliminate the need to
// have two calls to vite build in package.json:
//
// "build:client": "vite build --ssrManifest --outDir dist/client",
// "build:server": "vite build --ssr entry/server.js --outDir dist/server",
//
// We build client and server programatically if build is
// present in process.argv[2] in the script that uses fastify-vite.
//
// So instead we can just have:
//
// "dev": "node <file>.js"
// "build": "node <file>.js build"
//
// The check for 'build' in argv happens in fastifyVite.app(),
// which then uses the function exported by this file.

const { $, fs, path } = require('zx')

async function build (options) {
  const { root, vite } = options
  const outDir = vite.build.outDir ?? 'dist'
  const serverOutDir = `${outDir}/server`
  const serverEntryPoint = join(root, options.entry.server)
  await $`npx vite build --ssrManifest --outDir ${outDir} ${root}`
  await $`npx vite build --ssr ${serverEntryPoint} --outDir ${outDir} ${root}`
}

module.exports = { build }
