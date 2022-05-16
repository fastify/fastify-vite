import { reactive } from 'vue'

const state = reactive({
  todoList: []
})

export default (initialValues) => {
  Object.assign(state, initialValues)
  return state
}
