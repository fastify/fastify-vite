#!/usr/bin/env node

import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

// 1. Get project name from args (default to 'fastify-vite-app' if missing)
const projectName = process.argv[2] || 'fastify-vite-app'
const root = join(process.cwd(), projectName)

console.log(`Creating ${projectName}...`)

// 2. Create the project folder
mkdirSync(root, { recursive: true })

// 3. define the barebones package.json
const pkgJson = {
  name: projectName,
  type: 'module',
  scripts: {
    dev: 'fastify start -w server.js',
  },
  dependencies: {
    fastify: '^5.0.0',
    '@fastify/vite': '^8.0.0',
  },
}

// 4. Write package.json
writeFileSync(join(root, 'package.json'), JSON.stringify(pkgJson, null, 2))

// 5. Write a minimal server.js
const serverCode = `
import Fastify from 'fastify';
const fastify = Fastify({ logger: true });

fastify.get('/', async () => {
  return { hello: 'world' }
});

await fastify.listen({ port: 3000 });
`

writeFileSync(join(root, 'server.js'), serverCode.trim())

// 6. Done
console.log(`\nDone! Now run:\n  cd ${projectName}\n  npm install\n  npm run dev`)
