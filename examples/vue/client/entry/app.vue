<template>
  <router-view v-slot="{ Component }">
    <component :key="$route.path" :is="Component" />
  </router-view>
</template>
