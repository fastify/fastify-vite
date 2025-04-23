<template>
  <h1>{{ message }}</h1>
  <p><img :src="logo" /></p>
  <ul class="columns-2">
    <li v-for="locale in locales" :key="locale.code">
      <router-link :to="locale.route">{{ locale.fullPath }}</router-link> — <b>{{ locale.name }} locale based route</b> <code>/wildcard/*</code>
    </li>
  </ul>
</template>

<script setup>
import { useI18nUtils } from '/composables/i18n'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import logo from '/assets/logo.svg'

const { t } = useI18n()
const { localePath } = useI18nUtils()
const { resolve } = useRouter()

const locales = [
  { code: 'en', name: 'English' },
  { code: 'sv', name: 'Swedish' },
  { code: 'da', name: 'Danish' }
]

// This is just for demo purposes, normally you would just use <router-link :to="localePath({ name: 'wildcard' })">...</router-link>
for (const locale of locales) {
  locale.route = localePath({
    name: `${locale.code}__wildcard`,
    params: { slug: ['another', 'one'] }
  })

  locale.fullPath = resolve(locale.route).fullPath
}

const message = t('message.welcome')
</script>

<script>
import { i18n } from '/i18n.js'

export function getMeta ({ locale }) {
  i18n.global.locale.value = locale

  return {
    title: i18n.global.t('message.welcome')
  }
}
</script>

<style scoped>
img {
  width: 100%;
}
</style>
