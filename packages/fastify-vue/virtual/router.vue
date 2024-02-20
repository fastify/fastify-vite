<script setup>
import Layout from '/:layout.vue'
</script>

<template>
  <router-view v-slot="{ Component }">
    <template v-if="$isServer">
      <Layout>
        <component
          :is="Component"
          :key="$route.path"
        />
      </Layout>
    </template>
    <Suspense v-else>
      <Layout>
        <component
          :is="Component"
          :key="$route.path"
        />
      </Layout>
    </Suspense>
  </router-view>
</template>
