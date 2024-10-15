import test from 'node:test'

test('parseStateKeys', (t) => {
  const a = `export function state () {
    return {
      user: {
        authenticated: false,
      },
      todoList: null,
    }
  }`
  assert.equal(['user', 'todoList'], parseStateKeys(a))

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
  `;
  assert.equal(['user', 'todoList'], parseStateKeys(b))
})
