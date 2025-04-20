# Demo: Node.js type stripping

* Requires [Node.js v23.6.0](https://nodejs.org/en/blog/release/v23.6.0) or later.
* All the TypeScript code in this repository is run directly by Node.js, via [type stripping](https://nodejs.org/api/typescript.html).
* Limitation: Type stripping is not supported in packages. Therefore, we can only write apps directly in TypeScript and have to transpile packages.

## Using `src/playground.ts` as a simple TypeScript playground

```
cd nodejs-type-stripping/
npm install
npm run play
```

* Edit `src/playground.ts`. Whenever you save that file, Node.js runs it again and displays its output.

## More information

* 2ality blog post [“Simple TypeScript playground via `node --watch`”](https://2ality.com/2025/02/node-watch-typescript-playground.html)
* [“Modules: TypeScript”](https://nodejs.org/api/typescript.html) in the Node.js documentation
* Blog post [“Node’s new built-in support for TypeScript”](https://2ality.com/2025/01/nodejs-strip-type.html) on 2ality.com
* Blog post [“A guide to `tsconfig.json`”](https://2ality.com/2025/01/tsconfig-json.html) on 2ality.com
