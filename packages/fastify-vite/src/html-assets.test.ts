import { describe, expect, it } from 'vitest'
import { transformAssetUrls } from './html-assets.ts'

describe('transformAssetUrls', () => {
  it('transforms script src attributes', async () => {
    const html = '<script type="module" src="/assets/main.js"></script>'
    const result = await transformAssetUrls(html, '/', 'https://cdn.example.com')
    expect(result).toBe(
      '<script type="module" src="https://cdn.example.com/assets/main.js"></script>',
    )
  })

  it('transforms link href attributes', async () => {
    const html = '<link rel="stylesheet" href="/assets/style.css">'
    const result = await transformAssetUrls(html, '/', 'https://cdn.example.com')
    expect(result).toBe('<link rel="stylesheet" href="https://cdn.example.com/assets/style.css">')
  })

  it('transforms img src attributes', async () => {
    const html = '<img src="/assets/image.png" alt="test">'
    const result = await transformAssetUrls(html, '/', 'https://cdn.example.com')
    expect(result).toBe('<img src="https://cdn.example.com/assets/image.png" alt="test">')
  })

  it('transforms multiple asset types in the same document', async () => {
    const html = [
      '<!DOCTYPE html>',
      '<html>',
      '<head>',
      '  <link rel="stylesheet" href="/assets/style.css">',
      '  <script type="module" src="/assets/main.js"></script>',
      '</head>',
      '<body>',
      '  <img src="/assets/logo.png">',
      '</body>',
      '</html>',
    ].join('\n')

    const result = await transformAssetUrls(html, '/', 'https://cdn.example.com')

    expect(result).toContain('href="https://cdn.example.com/assets/style.css"')
    expect(result).toContain('src="https://cdn.example.com/assets/main.js"')
    expect(result).toContain('src="https://cdn.example.com/assets/logo.png"')
  })

  it('handles custom Vite base paths', async () => {
    const html = '<script type="module" src="/app/assets/main.js"></script>'
    const result = await transformAssetUrls(html, '/app/', 'https://cdn.example.com')
    expect(result).toBe(
      '<script type="module" src="https://cdn.example.com/assets/main.js"></script>',
    )
  })

  it('handles custom base path without trailing slash', async () => {
    const html = '<script type="module" src="/app/assets/main.js"></script>'
    const result = await transformAssetUrls(html, '/app', 'https://cdn.example.com')
    expect(result).toBe(
      '<script type="module" src="https://cdn.example.com/assets/main.js"></script>',
    )
  })

  it('preserves external http URLs', async () => {
    const html = '<script src="http://external.com/script.js"></script>'
    const result = await transformAssetUrls(html, '/', 'https://cdn.example.com')
    expect(result).toBe('<script src="http://external.com/script.js"></script>')
  })

  it('preserves external https URLs', async () => {
    const html = '<script src="https://external.com/script.js"></script>'
    const result = await transformAssetUrls(html, '/', 'https://cdn.example.com')
    expect(result).toBe('<script src="https://external.com/script.js"></script>')
  })

  it('preserves data URLs', async () => {
    const html = '<img src="data:image/png;base64,ABC123">'
    const result = await transformAssetUrls(html, '/', 'https://cdn.example.com')
    expect(result).toBe('<img src="data:image/png;base64,ABC123">')
  })

  it('transforms srcset attribute for img tags', async () => {
    const html = '<img srcset="/assets/small.jpg 1x, /assets/large.jpg 2x">'
    const result = await transformAssetUrls(html, '/', 'https://cdn.example.com')
    expect(result).toBe(
      '<img srcset="https://cdn.example.com/assets/small.jpg 1x, https://cdn.example.com/assets/large.jpg 2x">',
    )
  })

  it('transforms srcset attribute for source tags', async () => {
    const html = '<source srcset="/assets/image.webp" type="image/webp">'
    const result = await transformAssetUrls(html, '/', 'https://cdn.example.com')
    expect(result).toBe(
      '<source srcset="https://cdn.example.com/assets/image.webp" type="image/webp">',
    )
  })

  it('transforms video src and poster attributes', async () => {
    const html = '<video src="/assets/video.mp4" poster="/assets/poster.jpg"></video>'
    const result = await transformAssetUrls(html, '/', 'https://cdn.example.com')
    expect(result).toBe(
      '<video src="https://cdn.example.com/assets/video.mp4" poster="https://cdn.example.com/assets/poster.jpg"></video>',
    )
  })

  it('transforms audio src attribute', async () => {
    const html = '<audio src="/assets/audio.mp3"></audio>'
    const result = await transformAssetUrls(html, '/', 'https://cdn.example.com')
    expect(result).toBe('<audio src="https://cdn.example.com/assets/audio.mp3"></audio>')
  })

  it('normalizes trailing slash in CDN URL', async () => {
    const html = '<script src="/assets/main.js"></script>'
    const result = await transformAssetUrls(html, '/', 'https://cdn.example.com/')
    expect(result).toBe('<script src="https://cdn.example.com/assets/main.js"></script>')
  })

  it('does not transform URLs that do not match the base path', async () => {
    const html = '<script src="/other/script.js"></script>'
    const result = await transformAssetUrls(html, '/app/', 'https://cdn.example.com')
    expect(result).toBe('<script src="/other/script.js"></script>')
  })

  it('leaves URLs without base prefix unchanged when base is not /', async () => {
    const html = '<link href="/favicon.ico" rel="icon">'
    const result = await transformAssetUrls(html, '/app/', 'https://cdn.example.com')
    expect(result).toBe('<link href="/favicon.ico" rel="icon">')
  })
})
