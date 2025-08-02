import { describe, it, expect } from 'vitest'
import { sep } from 'node:path'
import { findCommonPath } from './plugin.mjs'

describe('findCommonPath', () => {
  it('should throw an error for empty input', () => {
    expect(() => findCommonPath([])).toThrow()
  })

  it('should return the path itself when only one path is provided', () => {
    expect(findCommonPath(['a/b/c'.split('/').join(sep)])).toBe('a/b/c'.split('/').join(sep))
  })

  it('should find the common path among multiple paths', () => {
    expect(findCommonPath(['a/b/c'.split('/').join(sep), 'a/b/d'.split('/').join(sep)])).toBe('a/b'.split('/').join(sep))
  })

  it('should return an empty string if there is no common path', () => {
    expect(findCommonPath(['a/b/c'.split('/').join(sep), 'd/e/f'.split('/').join(sep)])).toBe('')
  })

  it('should handle paths of different lengths', () => {
    expect(findCommonPath(['a/b/c/d'.split('/').join(sep), 'a/b'.split('/').join(sep)])).toBe('a/b'.split('/').join(sep))
  })

  it('should handle more than two paths', () => {
    expect(findCommonPath(['a/b/c'.split('/').join(sep), 'a/b/d'.split('/').join(sep), 'a/b/e'.split('/').join(sep)])).toBe('a/b'.split('/').join(sep))
  })

  it('should return the full path if all paths are identical', () => {
    expect(findCommonPath(['a/b/c'.split('/').join(sep), 'a/b/c'.split('/').join(sep), 'a/b/c'.split('/').join(sep)])).toBe('a/b/c'.split('/').join(sep))
  })

  it('should work with root paths', () => {
    const paths = ['/a/b/c'.split('/').join(sep), '/a/b/d'.split('/').join(sep)]
    // In Windows, a root path starts with a drive letter (e.g., C:).
    // The current logic will consider the drive letter part of the common path.
    // This test ensures it behaves as expected on both platforms.
    if (sep === '\\') {
      expect(findCommonPath(paths)).toBe(`${paths[0].split(sep)[0]}${sep}a${sep}b`)
    } else {
      expect(findCommonPath(paths)).toBe('/a/b'.split('/').join(sep))
    }
  })

  it('should be case-sensitive', () => {
    expect(findCommonPath(['A/b/c'.split('/').join(sep), 'a/b/d'.split('/').join(sep)])).toBe('')
  })
})
