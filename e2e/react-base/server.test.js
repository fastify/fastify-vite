import test from 'node:test'
import assert from 'node:assert/strict'
import { main } from './server.js'

const getClientTransform = async (server, id) => {
  const result = await server.vite.devServer.environments.client.transformRequest(id)
  assert.ok(result?.code, `${id} transformed code exists`)
  return result.code
}

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
