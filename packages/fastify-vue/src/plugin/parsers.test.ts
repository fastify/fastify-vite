import { describe, it, expect } from 'vitest'
import { parseStateKeys } from './parsers.ts'

describe('parseStateKeys', () => {
  it('parses function declaration state exports', () => {
    const a = `export function state () {
      return {
        user: {
          authenticated: false,
        },
        todoList: null,
      }
    }`
    expect(parseStateKeys(a)).toEqual(['user', 'todoList'])
  })

  it('parses arrow function state exports', () => {
    const b = `export const state = () => ({
      user: {
        authenticated: false,
      },
      todoList: null,
    })
    if (1) {
      const state = () => {

      }
    }
    `
    expect(parseStateKeys(b)).toEqual(['user', 'todoList'])
  })
})
