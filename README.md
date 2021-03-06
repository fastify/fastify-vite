# fastify-vite
![CI workflow](https://github.com/fastify/fastify-env/workflows/CI%20workflow/badge.svg)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Fastify plugin to serve Vite applications.

## Install

```
npm install --save fastify-vite
```

## Usage

```js
const fastify = require('fastify')()
const fastifyVite = require('fastify-vite')

fastify.register(fastifyVite, {
  rootDir: __dirname,
  srcDir: resolve(__dirname, 'src'),
  distDir: resolve(__dirname, 'dist'),
  prefix: '/',
})
```
