import { describe, expect, it } from 'vitest'
import { createHtmlTemplateFunction } from './html.ts'

describe('createHtmlTemplateFunction', () => {
  it('replaces comments without spaces <!-- element -->', async () => {
    const templateFn = await createHtmlTemplateFunction(
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

  it('leaves comments with spaces alone', async () => {
    const templateFn = await createHtmlTemplateFunction(
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

  it('doesnt break with certain special characers (#165/1)', async () => {
    const html = [
      '<script>',
      `console.log(\`%c Example 1 + 1 = \${1 + 1}\`, 'color: blue;');`,
      '</script>',
    ].join('\n')
    const templateFn = await createHtmlTemplateFunction(html)
    const resultStr = templateFn()
    expect(resultStr).toBe(html)
  })

  it('doesnt break with certain special characers (#165/2)', async () => {
    const html = [
      '<script>',
      `console.log(\`%c Example 1 + 1 = \\\${1 + 1}\`, 'color: blue;');`,
      '</script>',
    ].join('\n')
    const templateFn = await createHtmlTemplateFunction(html)
    const resultStr = templateFn()
    expect(resultStr).toBe(html)
  })

  it('identifies placeholders in attributes', async () => {
    const html = ['<script nonce="#nonce#">', '</script>'].join('\n')
    const templateFn = await createHtmlTemplateFunction(html)
    const resultStr = templateFn({ nonce: 'foobar' })
    expect(resultStr).toBe(html.replace('#nonce#', 'foobar'))
  })
})
