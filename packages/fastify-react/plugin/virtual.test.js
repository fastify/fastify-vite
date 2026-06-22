import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { loadVirtualModule, prefix, resolveId } from './virtual.js'

test('resolveId anchors built-in $app modules at the Vite root', async () => {
  const resolved = await resolveId.call({ root: import.meta.dirname }, '$app/layouts.js')

  assert.equal(resolved, '/$app/layouts.js')

  const [, virtual] = resolved.split(prefix)
  assert.equal(virtual, 'layouts.js')
  assert.ok(loadVirtualModule(virtual).code.includes("import.meta.glob('/layouts/*.{jsx,tsx}')"))
})

test('resolveId leaves project overrides as real files', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'fastify-react-virtual-'))
  t.after(() => rm(root, { recursive: true, force: true }))

  const override = join(root, 'layouts.js')
  await writeFile(override, 'export default {}')

  assert.equal(await resolveId.call({ root }, '$app/layouts.js'), override)
})
