<template>
  <ul>
    <li v-for="(listItem, i) in state.todoList" :key="`item-${i}`">
      {{ listItem }}
    </li>
  </ul>
  <div>
    <input v-model="item" />
    <button @click="addItem">Add</button>
  </div>
  <p>
    <router-link to="/other"> Go to another page </router-link>
  </p>
</template>

<script>
export default {
  inject: ['state'],
  data: () => ({
    item: '',
  }),
  methods: {
    async addItem() {
      this.state.todoList.push(this.item)
      this.item = ''
    },
  },
}
</script>
