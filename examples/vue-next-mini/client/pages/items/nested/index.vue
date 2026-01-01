<script>
export async function getServerSideProps ({ ky }) {
  return {
    todoList: await ky('api/todo-list').json()
  }
}
</script>

<template>
  <ul>
    <li v-for="(listItem, i) in $serverSideProps.todoList" :key="`item-${i}`">
      <router-link :to="`/items/nested/${i}`">
        {{ listItem }}
      </router-link>
    </li>
  </ul>
  <p>
    <router-link to="/"> Go to the index </router-link>
  </p>
</template>
