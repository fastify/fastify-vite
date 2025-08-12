import { createI18n } from 'vue-i18n'

const i18nConfig = createI18n({
  locale: 'en',
  legacy: false,
  fallbackLocale: 'en',
  messages: {
    sv: {
      message: {
        welcome: "Välkommen till {'@'}fastify/vue!",
      },
    },
    en: {
      message: {
        welcome: "Welcome to {'@'}fastify/vue!",
      },
    },
    da: {
      message: {
        welcome: "Velkommen til {'@'}fastify/vue!",
      },
    },
  },
})

export const i18n = i18nConfig