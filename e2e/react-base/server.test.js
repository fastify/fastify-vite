import test from 'node:test'
import assert from 'node:assert/strict'
import { makeBuildTest, makeIndexTest, makeStartFromOutsideTest } from '../test-factories.mjs'
import { main } from './server.js'

const getClientTransform = async (server, id) => {
  const result = await server.vite.devServer.environments.client.transformRequest(id)
  assert.ok(result?.code, `${id} transformed code exists`)
  return result.code
}

test('react-base', async (t) => {
  const cwd = import.meta.dirname

  await t.test('build production bundle', makeBuildTest({ cwd }))
  await t.test('render index page in production', makeIndexTest({ main }))
  await t.test('render index page in development', makeIndexTest({ main, dev: true }))
  await t.test('start from monorepo root', makeStartFromOutsideTest({ main }))
})

test('react-base resolves virtual module glob imports in development', async (t) => {
  const server = await main(true)
  t.after(() => server.close())

  const response = await server.inject({ method: 'GET', url: '/' })
  assert.equal(response.statusCode, 200)

  const layoutsCode = await getClientTransform(server, '$app/layouts.js')
  assert.match(layoutsCode, /import\("\/layouts\/default\.jsx"\)/)
  assert.doesNotMatch(layoutsCode, /\.\.\/client\/layouts\/default\.jsx/)

  const routesCode = await getClientTransform(server, '$app/routes.js')
  assert.match(routesCode, /import\("\/pages\/index\.jsx"\)/)
  assert.doesNotMatch(routesCode, /\.\.\/client\/pages\/index\.jsx/)
})
