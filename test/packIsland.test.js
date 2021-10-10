const { readFileSync } = require('fs')
const { resolve } = require('path')
const { test } = require('tap')
const { packIsland } = require('../packages/fastify-vite/app.js')

const fixture = {
  source: readFileSync(resolve(__dirname, 'packIsland.fixture.html'), 'utf8'),
  result: require('./packIsland.fixture.js'),
}

test('should parse html into Island object', (t) => {
  t.plan(2)
  packIsland()(null, null, fixture.source, (_, result) => {
    const expected = { ...fixture.result }
    t.same(result, fixture.result)
  })
  packIsland('header')(null, null, fixture.source, (_, result) => {
    t.same(result, {
      ...fixture.result,
      markup: fixture.result.markup.replace('id="app"', 'id="header"'),
    })
  })
})
