// eslint-disable-next-line node/no-deprecated-api
import { parse as uriParse } from 'url'

export function urlToRequire (url, transformAssetUrlsOption) {
  const returnValue = `"${url}"`
  if (
    isExternalUrl(url) ||
    isDataUrl(url) ||
    isHashUrl(url) ||
    isAbsolute(url)
  ) {
    return returnValue
  }
  // same logic as in transform-require.js
  const firstChar = url.charAt(0)
  if (firstChar === '~') {
    const secondChar = url.charAt(1)
    url = url.slice(secondChar === '/' ? 2 : 1)
  }

  const uriParts = parseUriParts(url)

  if (
    firstChar === '.' ||
    firstChar === '~' ||
    firstChar === '@' ||
    transformAssetUrlsOption.forceRequire
  ) {
    if (!uriParts.hash) {
      return `require("${url}")`
    } else {
      // support uri fragment case by excluding it from
      // the require and instead appending it as string;
      // assuming that the path part is sufficient according to
      // the above caseing(t.i. no protocol-auth-host parts expected)
      return `require("${uriParts.path}") + "${uriParts.hash}"`
    }
  }
  return returnValue
}

export function isHashUrl (url) {
  return url.startsWith('#')
}

const externalRE = /^(https?:)?\/\//
export function isExternalUrl (url) {
  return externalRE.test(url)
}

const dataUrlRE = /^\s*data:/i
export function isDataUrl (url) {
  return dataUrlRE.test(url)
}

export function isAbsolute (url) {
  return url.startsWith('/')
}

/**
 * vuejs/component-compiler-utils#22 Support uri fragment in transformed require
 * @param urlString an url as a string
 */
function parseUriParts (urlString) {
  // initialize return value
  const returnValue = uriParse('')
  if (urlString) {
    // A TypeError is thrown if urlString is not a string
    // @see https://nodejs.org/api/url.html#url_url_parse_urlstring_parsequerystring_slashesdenotehost
    if (typeof urlString === 'string') {
      // check is an uri
      return uriParse(urlString) // take apart the uri
    }
  }
  return returnValue
}
