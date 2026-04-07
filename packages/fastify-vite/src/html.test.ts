import { describe, expect, it } from 'vitest'
import { createHtmlTemplateFunction, removeHtmlModuleScripts } from './html.ts'

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

  it('does not replace placeholders inside script tags', () => {
    const html = [
      '<script>',
      'const raw = "<!-- element -->"',
      '</script>',
      '<!-- element -->',
    ].join('\n')

    const templateFn = createHtmlTemplateFunction(html)

    expect(templateFn({ element: '<div>ok</div>' })).toBe(
      ['<script>', 'const raw = "<!-- element -->"', '</script>', '<div>ok</div>'].join('\n'),
    )
  })
})

describe('removeHtmlModuleScripts', () => {
  it('removes module scripts with flexible spacing', () => {
    const html = [
      '<div>before</div>',
      '<script type = module src="./mount.js">console.log(1)</script >',
      '<script type="application/json">{"ok":true}</script>',
      '<div>after</div>',
    ].join('\n')

    expect(removeHtmlModuleScripts(html)).toBe(
      [
        '<div>before</div>',
        '',
        '<script type="application/json">{"ok":true}</script>',
        '<div>after</div>',
      ].join('\n'),
    )
  })
})
