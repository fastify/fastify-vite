<template>
  <h1>1: getPayload() and usePayload()</h1>
  <p v-for="{ text, to } in links">
    <router-link :to="to">{{ text }}</router-link>
  </p>
</template>

<script>
export const path = '/'

export default {
  data () {
    return {
      links: [
        {text: 'Works', to: '/'}
      ]
    }
  }
}
</script>
