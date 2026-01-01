<script>
export async function getServerSideProps ({ req, ky }) {
  const todoList = await ky('api/todo-list').json()
  return { item: todoList[req.params.id] }
}
</script>

<template>
  <p>{{ $serverSideProps.item }}</p>
  <p>
    <router-link to="/"> Go to the index </router-link>
  </p>
</template>
