import { HTMLRewriter } from 'html-rewriter-wasm'

/**
 * Transforms asset URLs in HTML content from one base path to a CDN URL.
 *
 * @param html - The HTML content to transform
 * @param originalBase - The original Vite base path (e.g., '/' or '/app/')
 * @param baseAssetUrl - The CDN base URL (e.g., 'https://cdn.example.com')
 * @returns Transformed HTML with asset URLs pointing to the CDN
 */
export async function transformAssetUrls(
  html: string,
  originalBase: string,
  baseAssetUrl: string,
): Promise<string> {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  let output = ''
  const rewriter = new HTMLRewriter((chunk) => {
    output += decoder.decode(chunk)
  })

  // Normalize paths: ensure originalBase ends with / and baseAssetUrl has no trailing /
  const normalizedBase = originalBase.endsWith('/') ? originalBase : `${originalBase}/`
  const normalizedCdn = baseAssetUrl.endsWith('/') ? baseAssetUrl.slice(0, -1) : baseAssetUrl

  const transformUrl = (url: string | null): string | null => {
    if (!url) return null

    // Skip external URLs and data URLs
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return null
    }

    // Check if URL starts with the original base
    if (url.startsWith(normalizedBase)) {
      // Replace base with CDN URL
      const path = url.slice(normalizedBase.length)
      return `${normalizedCdn}/${path}`
    }

    // Handle URLs starting with just /
    if (normalizedBase === '/' && url.startsWith('/') && !url.startsWith('//')) {
      return `${normalizedCdn}${url}`
    }

    return null
  }

  const transformSrcset = (srcset: string | null): string | null => {
    if (!srcset) return null

    const entries = srcset.split(',').map((entry) => entry.trim())
    let modified = false

    const transformed = entries.map((entry) => {
      const parts = entry.split(/\s+/)
      if (parts.length === 0) return entry

      const url = parts[0]
      const newUrl = transformUrl(url)
      if (newUrl) {
        modified = true
        parts[0] = newUrl
      }
      return parts.join(' ')
    })

    return modified ? transformed.join(', ') : null
  }

  // Tags with src attribute
  const srcTags = ['script', 'img', 'source', 'video', 'audio']
  for (const tag of srcTags) {
    rewriter.on(tag, {
      element(element) {
        const src = element.getAttribute('src')
        const newSrc = transformUrl(src)
        if (newSrc) {
          element.setAttribute('src', newSrc)
        }

        // Handle srcset for img and source
        if (tag === 'img' || tag === 'source') {
          const srcset = element.getAttribute('srcset')
          const newSrcset = transformSrcset(srcset)
          if (newSrcset) {
            element.setAttribute('srcset', newSrcset)
          }
        }

        // Handle poster for video
        if (tag === 'video') {
          const poster = element.getAttribute('poster')
          const newPoster = transformUrl(poster)
          if (newPoster) {
            element.setAttribute('poster', newPoster)
          }
        }
      },
    })
  }

  // Link tag with href attribute
  rewriter.on('link', {
    element(element) {
      const href = element.getAttribute('href')
      const newHref = transformUrl(href)
      if (newHref) {
        element.setAttribute('href', newHref)
      }
    },
  })

  try {
    await rewriter.write(encoder.encode(html))
    await rewriter.end()
  } finally {
    rewriter.free()
  }

  return output
}
