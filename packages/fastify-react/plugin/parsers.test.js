import test from 'node:test'
import assert from 'node:assert/strict'
import { parseStateKeys } from './parsers.js'

test('parseStateKeys', () => {
  const a = `export function state () {
    return {
      user: {
        authenticated: false,
      },
      todoList: null,
    }
  }`
  assert.deepStrictEqual(parseStateKeys(a), ['user', 'todoList'])

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
  assert.deepStrictEqual(parseStateKeys(b), ['user', 'todoList'])
})
