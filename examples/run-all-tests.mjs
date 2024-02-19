const root = path.resolve(__dirname)

for (const item of fs.readdirSync(root)) {
  const full = path.join(root, item)
  if (fs.lstatSync(full).isDirectory()) {
    if (full.includes('node_modules') || full.includes('slidev') || item.includes('test-all.mjs')) {
      continue
    }
    cd(full)
    await $`pnpm run test`
    await $`sleep 2`
  }
}
