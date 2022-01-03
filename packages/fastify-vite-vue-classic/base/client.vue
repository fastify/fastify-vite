<template>
  <template v-if="error">
    <Error :error="error" />
  </template>
  <template v-else>
    <Router />
  </template>
</template>

<script>
// import { ref, computed, onErrorCaptured } from 'vue'
// import { useHead } from '@vueuse/head'
// import { useIsomorphic } from 'fastify-vite-vue-classic/app'

import Router from '@app/router.vue'
import Error from '@app/error.vue'

import * as head from '@app/head.js'

export default {
  components: {
    Error,
    Router,
  },
  created () {
    // // const ctx = useIsomorphic()

    // // if (typeof head?.default === 'function') {
    // //   useHead(head.default(ctx))
    // // } else {
    // //   useHead(head.default ?? head)
    // // }

    // onErrorCaptured((error) => {
    //   ctx.$error = error
    // })

    // return {
    //   error: computed(() => ctx.$error)
    // }
  },
}
</script>
