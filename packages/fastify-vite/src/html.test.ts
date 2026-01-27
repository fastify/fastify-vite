import { describe, expect, it } from 'vitest'
import { createHtmlTemplateFunction } from './html.ts'

describe('createHtmlTemplateFunction', () => {
  it('replaces comments without spaces <!-- element -->', () => {
    const templateFn = createHtmlTemplateFunction(
      [
        '<!doctype html>',
        '<!-- element -->',
        '<script type="module" src="./mount.js"></script>',
      ].join('\n'),
    )
    const resultStr = templateFn({ element: 'walalalala' })

    expect(resultStr).toBe(
      ['<!doctype html>', 'walalalala', '<script type="module" src="./mount.js"></script>'].join(
        '\n',
      ),
    )
  })

  it('leaves comments with spaces alone', () => {
    const templateFn = createHtmlTemplateFunction(
      [
        '<!-- arbitrary comment -->',
        '<!doctype html>',
        '<!-- detailed explanation here -->',
        '<script type="module" src="./mount.js"></script>',
        '<!-- secret easter egg note -->',
      ].join('\n'),
    )
    const resultStr = templateFn({ element: '' })

    expect(resultStr).toBe(
      [
        '<!-- arbitrary comment -->',
        '<!doctype html>',
        '<!-- detailed explanation here -->',
        '<script type="module" src="./mount.js"></script>',
        '<!-- secret easter egg note -->',
      ].join('\n'),
    )
  })

  it('doesnt break with certain special characers (#165/1)', () => {
    const html = [
      '<script>',
      `console.log(\`%c Example 1 + 1 = \${1 + 1}\`, 'color: blue;');`,
      '</script>',
    ].join('\n')
    const templateFn = createHtmlTemplateFunction(html)
    const resultStr = templateFn()
    expect(resultStr).toBe(html)
  })

  it('doesnt break with certain special characers (#165/2)', () => {
    const html = [
      '<script>',
      `console.log(\`%c Example 1 + 1 = \\\${1 + 1}\`, 'color: blue;');`,
      '</script>',
    ].join('\n')
    const templateFn = createHtmlTemplateFunction(html)
    const resultStr = templateFn()
    expect(resultStr).toBe(html)
  })
})
