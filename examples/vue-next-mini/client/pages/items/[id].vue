<script>
export async function getServerSideProps ({ req, ky }) {
  if (Math.random() > 0.5) {
    throw new Error('This error was intentionally thrown')
  }
  // eslint-disable-next-line no-unreachable
  const todoList = await ky('api/todo-list').json()
  return { item: todoList[req.params.id] }
}
</script>

<template>
  <p v-if="$error">
    Error: {{ $error }}
  </p>
  <p v-else>
    {{ $serverSideProps.item }}
  </p>
  <p>
    <router-link to="/">
      Go to the index
    </router-link>
  </p>
</template>
