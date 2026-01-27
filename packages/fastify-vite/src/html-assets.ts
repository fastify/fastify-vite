/**
 * Transforms asset URLs in HTML content from one base path to a CDN URL.
 *
 * @param html - The HTML content to transform
 * @param originalBase - The original Vite base path (e.g., '/' or '/app/')
 * @param baseAssetUrl - The CDN base URL (e.g., 'https://cdn.example.com')
 * @returns Transformed HTML with asset URLs pointing to the CDN
 */
export function transformAssetUrls(
  html: string,
  originalBase: string,
  baseAssetUrl: string,
): string {
  // Normalize paths: ensure originalBase ends with / and baseAssetUrl has no trailing /
  const normalizedBase = originalBase.endsWith('/') ? originalBase : `${originalBase}/`
  const normalizedCdn = baseAssetUrl.endsWith('/') ? baseAssetUrl.slice(0, -1) : baseAssetUrl

  const transformUrl = (url: string): string | null => {
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

  const transformSrcset = (srcset: string): string | null => {
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

  let result = html

  // Transform src attributes on script, img, source, video, audio
  result = result.replace(
    /(<(?:script|img|source|video|audio)\s[^>]*\bsrc\s*=\s*)(["'])([^"']*)\2/gi,
    (match, prefix, quote, url) => {
      const newUrl = transformUrl(url)
      return newUrl ? `${prefix}${quote}${newUrl}${quote}` : match
    },
  )

  // Transform href attributes on link tags
  result = result.replace(
    /(<link\s[^>]*\bhref\s*=\s*)(["'])([^"']*)\2/gi,
    (match, prefix, quote, url) => {
      const newUrl = transformUrl(url)
      return newUrl ? `${prefix}${quote}${newUrl}${quote}` : match
    },
  )

  // Transform srcset attributes on img and source
  result = result.replace(
    /(<(?:img|source)\s[^>]*\bsrcset\s*=\s*)(["'])([^"']*)\2/gi,
    (match, prefix, quote, srcset) => {
      const newSrcset = transformSrcset(srcset)
      return newSrcset ? `${prefix}${quote}${newSrcset}${quote}` : match
    },
  )

  // Transform poster attributes on video
  result = result.replace(
    /(<video\s[^>]*\bposter\s*=\s*)(["'])([^"']*)\2/gi,
    (match, prefix, quote, url) => {
      const newUrl = transformUrl(url)
      return newUrl ? `${prefix}${quote}${newUrl}${quote}` : match
    },
  )

  return result
}
