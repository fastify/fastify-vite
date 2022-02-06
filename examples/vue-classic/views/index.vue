<template>
  <div>
    <h1>1: getPayload() 1 and usePayload()</h1>
    <p v-for="{ text, to } in links">
      <router-link :to="to">{{ text }}</router-link>
    </p>
  </div>
</template>

<script>
export const path = '/'

export default {
  head: {
    title: 'hello!',
  },
  data () {
    return {
      links: [
        {text: 'Works', to: '/'}
      ]
    }
  }
}
</script>
