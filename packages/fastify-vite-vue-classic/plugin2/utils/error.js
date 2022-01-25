
export function createRollupError (id, error) {
  error.id = id
  error.plugin = 'vite-plugin-vue2'

  return error
}
